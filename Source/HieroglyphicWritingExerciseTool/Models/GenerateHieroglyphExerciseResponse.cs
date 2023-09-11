using System;

namespace HieroglyphicWritingExerciseTool.Models;

public class GenerateHieroglyphExerciseResponse
{
    public HieroglyphModel[] Hieroglyphs { get; set; } = Array.Empty<HieroglyphModel>();
}
