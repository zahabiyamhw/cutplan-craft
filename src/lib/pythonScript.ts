export const getPythonScript = () => `
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict
import uuid
import copy
import time

# -----------------------
# Data Structures
# -----------------------

@dataclass
class Part:
    name: str
    width: int
    height: int
    quantity: int
    can_rotate: bool = True

@dataclass
class Cut:
    x1: int
    y1: int
    x2: int
    y2: int
    index: int

@dataclass
class SheetWithCuts:
    width: int
    height: int
    kerf: int
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    free_rects: List[Tuple[int, int, int, int]] = field(default_factory=list)
    placed_parts: List[Dict] = field(default_factory=list)
    cut_sequence: List[Cut] = field(default_factory=list)

    def __post_init__(self):
        self.free_rects.append((0, 0, self.width, self.height))

    def try_place_part(self, part: Part, allow_rotations: bool) -> Optional[Dict]:
        fits_normal = []
        fits_rotated = []

        for i, (fx, fy, fw, fh) in enumerate(self.free_rects):
            pw, ph = part.width, part.height
            kerf_w = self.kerf if fw != pw else 0
            kerf_h = self.kerf if fh != ph else 0
            total_pw = pw + kerf_w
            total_ph = ph + kerf_h
            if fw >= total_pw and fh >= total_ph:
                fits_normal.append((i, fx, fy, fw, fh, pw, ph, kerf_w, kerf_h, False))
            if allow_rotations and part.can_rotate:
                pw_r, ph_r = part.height, part.width
                kerf_w_r = self.kerf if fw != pw_r else 0
                kerf_h_r = self.kerf if fh != ph_r else 0
                total_pw_r = pw_r + kerf_w_r
                total_ph_r = ph_r + kerf_h_r
                if fw >= total_pw_r and fh >= total_ph_r:
                    fits_rotated.append((i, fx, fy, fw, fh, pw_r, ph_r, kerf_w_r, kerf_h_r, True))

        candidates = fits_normal if fits_normal else fits_rotated
        if not candidates:
            return None
        best_candidate = None
        best_score = float('inf')
        previous_orientation = None
        if self.placed_parts:
            previous_orientation = self.placed_parts[-1]["rotated"]
        for cand in candidates:
            i, fx, fy, fw, fh, pw, ph, kerf_w, kerf_h, rotated = cand
            waste = (fw - (pw + kerf_w)) * ph + fw * (fh - (ph + kerf_h))
            orientation_penalty = 0
            if previous_orientation is not None and previous_orientation != rotated:
                orientation_penalty = 1000
            cut_penalty = 0
            if fw - (pw + kerf_w) > 0 and fh - (ph + kerf_h) > 0:
                cut_penalty = 1500
            score = waste + orientation_penalty + cut_penalty
            if score < best_score:
                best_score = score
                best_candidate = cand
        if best_candidate:
            i, fx, fy, fw, fh, pw, ph, kerf_w, kerf_h, rotated = best_candidate
            part_placement = {
                "part_name": part.name,
                "x": fx,
                "y": fy,
                "width": pw,
                "height": ph,
                "rotated": rotated,
                "sheet_id": self.id
            }
            self.placed_parts.append(part_placement)

            right_x = fx + pw + kerf_w
            bottom_y = fy + ph + kerf_h

            if fw - (pw + kerf_w) > 0:
                self.cut_sequence.append(Cut(right_x, fy, right_x, fy + ph, len(self.cut_sequence) + 1))
            if fh - (ph + kerf_h) > 0:
                self.cut_sequence.append(Cut(fx, bottom_y, fx + fw, bottom_y, len(self.cut_sequence) + 1))

            right_rect = (fx + pw + kerf_w, fy, fw - (pw + kerf_w), ph)
            bottom_rect = (fx, fy + ph + kerf_h, fw, fh - (ph + kerf_h))

            del self.free_rects[i]
            if right_rect[2] > 0 and right_rect[3] > 0:
                self.free_rects.append(right_rect)
            if bottom_rect[2] > 0 and bottom_rect[3] > 0:
                self.free_rects.append(bottom_rect)
            return part_placement

        return None

    def get_waste_area(self) -> int:
        return sum(w * h for _, _, w, h in self.free_rects)

@dataclass
class BestSolution:
    sheets: Optional[List[SheetWithCuts]] = None
    score: Tuple[int, int, float] = (float('inf'), float('inf'), float('inf'))

def score_solution(sheets: List[SheetWithCuts]) -> Tuple[int, int, float]:
    total_waste = 0
    total_fragments = 0
    total_area = 0

    for sheet in sheets:
        sheet_area = sheet.width * sheet.height
        used_area = sum(p["width"] * p["height"] for p in sheet.placed_parts)
        waste = sheet_area - used_area
        total_waste += waste
        total_area += sheet_area
        total_fragments += len(sheet.free_rects)

    fragmentation_penalty = total_fragments / len(sheets) if sheets else 0
    smart_score = len(sheets) * 100000 + total_waste + 30 * fragmentation_penalty
    return (len(sheets), total_waste, smart_score)

def deep_copy_sheets(sheets):
    return [copy.deepcopy(sheet) for sheet in sheets]

def branch_and_bound_backtracking(
    parts_to_place,
    sheets,
    best,
    allow_rotations,
    kerf,
    sheet_width,
    sheet_height,
    start_time,
    time_limit=5.0
):
    if time.time() - start_time > time_limit:
        return

    if not parts_to_place:
        current_score = score_solution(sheets)
        if current_score[2] < best.score[2]: 
            best.sheets = deep_copy_sheets(sheets)
            best.score = current_score
        return

    part = parts_to_place[0]
    remaining_parts = parts_to_place[1:]
    attempted = False

    for sheet_index, sheet in enumerate(sheets):
        for (fx, fy, fw, fh) in sheet.free_rects:
            for rotated in [False, True] if allow_rotations and part.can_rotate else [False]:
                if not rotated:
                    pw, ph = part.width, part.height
                else:
                    pw, ph = part.height, part.width
                kerf_w = kerf if fw != pw else 0
                kerf_h = kerf if fh != ph else 0
                total_pw = pw + kerf_w
                total_ph = ph + kerf_h

                if fw >= total_pw and fh >= total_ph:
                    sheet_clone = copy.deepcopy(sheet)
                    part_clone = copy.deepcopy(part)
                    part_clone.width, part_clone.height = pw, ph
                    part_clone.can_rotate = part.can_rotate

                    placement = sheet_clone.try_place_part(part_clone, allow_rotations=False)
                    if placement:
                        sheets_clone = deep_copy_sheets(sheets)
                        sheets_clone[sheet_index] = sheet_clone
                        if len(sheets_clone) <= best.score[0]:
                            branch_and_bound_backtracking(
                                remaining_parts,
                                sheets_clone,
                                best,
                                allow_rotations,
                                kerf,
                                sheet_width,
                                sheet_height,
                                start_time,
                                time_limit
                            )
                        attempted = True

    if not attempted:
        new_sheet = SheetWithCuts(sheet_width, sheet_height, kerf)
        new_sheet.try_place_part(part, allow_rotations)
        new_sheets = sheets + [new_sheet]

        if score_solution(new_sheets)[2] < best.score[2]:
            branch_and_bound_backtracking(
                remaining_parts,
                new_sheets,
                best,
                allow_rotations,
                kerf,
                sheet_width,
                sheet_height,
                start_time,
                time_limit
            )

def generate_svg_string(sheets: List[SheetWithCuts], scale: float = 0.3) -> str:
    padding = 20
    sheet_margin = 50
    current_y = padding
    
    max_width = 0
    total_height = padding
    
    for sheet in sheets:
        sheet_w = sheet.width * scale
        sheet_h = sheet.height * scale
        max_width = max(max_width, sheet_w + 2 * padding)
        total_height += sheet_h + sheet_margin
    
    svg_parts = []
    svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{max_width}" height="{total_height}" viewBox="0 0 {max_width} {total_height}">')
    
    for si, sheet in enumerate(sheets):
        sheet_x = padding
        sheet_y = current_y
        sheet_w = sheet.width * scale
        sheet_h = sheet.height * scale
        
        svg_parts.append(f'<rect x="{sheet_x}" y="{sheet_y}" width="{sheet_w}" height="{sheet_h}" fill="#f9f9f9" stroke="black" stroke-width="1"/>')
        svg_parts.append(f'<text x="{sheet_x}" y="{sheet_y - 5}" font-size="12" fill="black">Sheet {si+1}</text>')
        
        for part in sheet.placed_parts:
            px = sheet_x + part["x"] * scale
            py = sheet_y + part["y"] * scale
            pw = part["width"] * scale
            ph = part["height"] * scale
            
            svg_parts.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" fill="#b3cde0" stroke="blue" stroke-width="0.5"/>')
            svg_parts.append(f'<text x="{px + 2}" y="{py + 12}" font-size="10" fill="black">{part["part_name"]}</text>')
        
        for cut in sheet.cut_sequence:
            x1 = sheet_x + cut.x1 * scale
            y1 = sheet_y + cut.y1 * scale
            x2 = sheet_x + cut.x2 * scale
            y2 = sheet_y + cut.y2 * scale
            
            svg_parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="red" stroke-dasharray="4,2" stroke-width="0.8"/>')
            label_x = (x1 + x2) / 2
            label_y = (y1 + y2) / 2
            svg_parts.append(f'<text x="{label_x + 3}" y="{label_y - 3}" font-size="8" fill="red">{cut.index}</text>')
        
        current_y += sheet_h + sheet_margin
    
    svg_parts.append('</svg>')
    return ''.join(svg_parts)

def run_optimizer(parts_data, sheet_width, sheet_height, kerf, allow_rotations, time_limit=5.0):
    parts = []
    for p in parts_data:
        parts.append(Part(
            name=p['name'],
            width=p['width'],
            height=p['height'],
            quantity=p['quantity'],
            can_rotate=p['canRotate']
        ))
    
    expanded_parts = []
    for part in parts:
        for _ in range(part.quantity):
            expanded_parts.append(copy.deepcopy(part))
    
    def awkwardness(part, sheet_w=sheet_width, sheet_h=sheet_height):
        area = part.width * part.height
        part_ratio = part.width / part.height if part.height != 0 else 1
        sheet_ratio = sheet_w / sheet_h if sheet_h != 0 else 1
        ratio_diff = abs(part_ratio - sheet_ratio)
        return (area, -ratio_diff)
    
    expanded_parts.sort(key=lambda p: awkwardness(p), reverse=True)
    
    best = BestSolution()
    start = time.time()
    
    branch_and_bound_backtracking(
        parts_to_place=expanded_parts,
        sheets=[],
        best=best,
        allow_rotations=allow_rotations,
        kerf=kerf,
        sheet_width=sheet_width,
        sheet_height=sheet_height,
        start_time=start,
        time_limit=time_limit
    )
    
    if best.sheets:
        return generate_svg_string(best.sheets)
    return None
`;
