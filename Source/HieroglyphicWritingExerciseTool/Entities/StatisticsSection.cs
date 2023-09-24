using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

public class StatisticsSection
{
    [XmlAttribute("Key")]
    public string Key { get; set; } = string.Empty;

    [XmlElement("ExercisesCount")]
    public int ExercisesCount { get; set; }

    [XmlElement("AverageTimeMilliseconds")]
    public double AverageTimeMilliseconds { get; set; }

    [XmlElement("MinTimeMilliseconds")]
    public double MinTimeMilliseconds { get; set; }

    [XmlElement("MaxTimeMilliseconds")]
    public double MaxTimeMilliseconds { get; set; }
}
