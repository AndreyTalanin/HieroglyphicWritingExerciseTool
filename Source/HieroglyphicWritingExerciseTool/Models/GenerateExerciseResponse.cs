using System;

namespace HieroglyphicWritingExerciseTool.Models;

public class GenerateExerciseResponse
{
    public HieroglyphModel[] Hieroglyphs { get; set; } = Array.Empty<HieroglyphModel>();
}
