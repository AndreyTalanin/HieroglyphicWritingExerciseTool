using System;
using System.Xml.Serialization;

namespace HieroglyphicWritingExerciseTool.Entities;

[XmlRoot("HieroglyphDictionary")]
public class HieroglyphDictionary
{
    [XmlArray("Hieroglyphs")]
    [XmlArrayItem("Hieroglyph")]
    public Hieroglyph[] Hieroglyphs { get; set; } = Array.Empty<Hieroglyph>();
}