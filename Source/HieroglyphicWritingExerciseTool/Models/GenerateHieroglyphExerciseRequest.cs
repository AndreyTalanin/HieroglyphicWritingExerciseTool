namespace HieroglyphicWritingExerciseTool.Models;

public class GenerateHieroglyphExerciseRequest
{
    public bool UseKanji { get; set; }

    public bool UseKanjiOnly { get; set; }

    public int Size { get; set; }
}
