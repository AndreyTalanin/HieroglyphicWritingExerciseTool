import { HieroglyphModel } from "./HieroglyphModel";

export interface GenerateHieroglyphExerciseResponse {
  useKanjiColumns: boolean;
  useKanjiColumnsOnly: boolean;
  hieroglyphs: HieroglyphModel[];
}
