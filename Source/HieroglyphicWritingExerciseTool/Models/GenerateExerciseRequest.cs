namespace HieroglyphicWritingExerciseTool.Models;

public class GenerateExerciseRequest
{
    public bool UseKanji { get; set; }

    public bool UseKanjiOnly { get; set; }

    public int Size { get; set; }
}
