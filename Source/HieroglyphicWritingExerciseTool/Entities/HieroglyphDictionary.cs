using System;
using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

[XmlRoot("HieroglyphDictionary")]
public class HieroglyphDictionary
{
    [XmlArray("Hieroglyphs")]
    [XmlArrayItem("Hieroglyph")]
    public Hieroglyph[] Hieroglyphs { get; set; } = Array.Empty<Hieroglyph>();

    [XmlArray("HieroglyphGroups")]
    [XmlArrayItem("HieroglyphGroup")]
    public HieroglyphGroup[] HieroglyphGroups { get; set; } = Array.Empty<HieroglyphGroup>();

    [XmlArray("HieroglyphWords")]
    [XmlArrayItem("HieroglyphWord")]
    public HieroglyphWord[] HieroglyphWords { get; set; } = Array.Empty<HieroglyphWord>();

    [XmlArray("HieroglyphWordGroups")]
    [XmlArrayItem("HieroglyphWordGroup")]
    public HieroglyphWordGroup[] HieroglyphWordGroups { get; set; } = Array.Empty<HieroglyphWordGroup>();
}
