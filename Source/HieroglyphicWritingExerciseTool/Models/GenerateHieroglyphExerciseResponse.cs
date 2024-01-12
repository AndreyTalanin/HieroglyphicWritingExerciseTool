using System;

namespace HieroglyphicWritingExerciseTool.Models;

public class GenerateHieroglyphExerciseResponse
{
    public bool UseKanjiColumns { get; set; }

    public bool UseKanjiColumnsOnly { get; set; }

    public HieroglyphModel[] Hieroglyphs { get; set; } = Array.Empty<HieroglyphModel>();
}
