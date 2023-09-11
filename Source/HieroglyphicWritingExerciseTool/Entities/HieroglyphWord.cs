using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

public class HieroglyphWord
{
    [XmlAttribute("Type")]
    public HieroglyphType Type { get; set; }

    [XmlAttribute("Characters")]
    public string Characters { get; set; } = string.Empty;

    [XmlAttribute("Pronunciation")]
    public string Pronunciation { get; set; } = string.Empty;

    [XmlAttribute("Meaning")]
    public string Meaning { get; set; } = string.Empty;
}
