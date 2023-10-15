using System;
using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

public class HieroglyphGroup
{
    [XmlAttribute("Name")]
    public string Name { get; set; } = string.Empty;

    [XmlAttribute("Enabled")]
    public bool Enabled { get; set; }

    [XmlElement("Hieroglyph")]
    public Hieroglyph[] Hieroglyphs { get; set; } = Array.Empty<Hieroglyph>();

    [XmlAttribute("Comment")]
    public string? Comment { get; set; }
}
