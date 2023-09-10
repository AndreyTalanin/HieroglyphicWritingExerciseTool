namespace HieroglyphicWritingExerciseTool.Models;

public class HieroglyphModel
{
    public string Type { get; set; } = string.Empty;

    public string Character { get; set; } = string.Empty;

    public string Pronunciation { get; set; } = string.Empty;

    public string? Syllable { get; set; }

    public string? Meaning { get; set; }
}
