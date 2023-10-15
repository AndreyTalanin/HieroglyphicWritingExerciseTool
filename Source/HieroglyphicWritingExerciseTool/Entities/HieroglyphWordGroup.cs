using System;
using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

public class HieroglyphWordGroup
{
    [XmlAttribute("Name")]
    public string Name { get; set; } = string.Empty;

    [XmlAttribute("Enabled")]
    public bool Enabled { get; set; }

    [XmlElement("HieroglyphWord")]
    public HieroglyphWord[] HieroglyphWords { get; set; } = Array.Empty<HieroglyphWord>();

    [XmlAttribute("Comment")]
    public string? Comment { get; set; }
}
