Drop portrait files here, one per designer, named to match the "slug" field
in data/designers.json:

  jan-01.svg   -> Mirko Ilić
  jan-02.svg   -> Tina Roth-Eisenberg
  jan-03.svg   -> Walter Herdeg
  jan-04.svg   -> Louis Braille

Export each portrait from the Figma "Personal-Exploration" file, Portrait
page, as SVG, transparent background. The page already knows how to use
them — until a file is added, that designer's circle shows their initials
as a placeholder instead.

When you add more days to data/designers.json, just add the matching
{day}.svg file here using the same slug naming pattern (e.g. "jan-05.svg").
