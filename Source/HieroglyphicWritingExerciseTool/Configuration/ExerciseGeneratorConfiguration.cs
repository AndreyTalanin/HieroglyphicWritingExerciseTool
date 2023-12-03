using System.Collections.Generic;

namespace HieroglyphicWritingExerciseTool.Configuration;

public class ExerciseGeneratorConfiguration
{
    public int DefaultExerciseSize { get; set; }

    public string HieroglyphDictionaryFileName { get; set; } = string.Empty;

    public Dictionary<string, int> TagsDistribution { get; set; } = new Dictionary<string, int>();
}
