using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

public class Hieroglyph
{
    [XmlAttribute("Type")]
    public HieroglyphType Type { get; set; }

    [XmlAttribute("Character")]
    public string Character { get; set; } = string.Empty;

    [XmlAttribute("Pronunciation")]
    public string Pronunciation { get; set; } = string.Empty;

    [XmlAttribute("Syllable")]
    public string? Syllable { get; set; }

    [XmlAttribute("Meaning")]
    public string? Meaning { get; set; }
}
