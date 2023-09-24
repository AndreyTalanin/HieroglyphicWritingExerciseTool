using System;
using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

[XmlRoot("StatisticsStorage")]
public class StatisticsStorage
{
    [XmlArray("StatisticsSections")]
    [XmlArrayItem("StatisticsSection")]
    public StatisticsSection[] StatisticsSections { get; set; } = Array.Empty<StatisticsSection>();
}
