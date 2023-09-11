using System;

namespace HieroglyphicWritingExerciseTool.Models;

public class GenerateHieroglyphWordExerciseResponse
{
    public HieroglyphWordModel[] HieroglyphWords { get; set; } = Array.Empty<HieroglyphWordModel>();
}
