const customers = [
  {
    name: "Shivam Infra Projects",
    address: "Ahmedabad, Gujarat"
  },
  {
    name: "Prime Buildchem",
    address: "Vadodara, Gujarat"
  }
];

const products = [
  {
    tradeName: "Silica Sand",
    availableSizes: ["30/60", "40/80", "80/120"],
    standards: [
      {
        standardName: "IS 1987",
        grades: ["30/60", "40/80"],
        analyses: [
          {
            title: "Physical Analysis",
            parameters: [
              { parameter: "Appearance", requiredResult: "Free flowing", referenceMethod: "Visual" },
              { parameter: "Moisture", requiredResult: "Max 0.5%", referenceMethod: "IS 1918" }
            ]
          },
          {
            title: "Chemical Analysis",
            parameters: [
              { parameter: "SiO2", requiredResult: "Min 98.0%", referenceMethod: "IS 1917" },
              { parameter: "Fe2O3", requiredResult: "Max 0.08%", referenceMethod: "IS 1917" }
            ]
          },
          {
            title: "Sieve Analysis",
            parameters: [
              { parameter: "Retained on 600 micron", requiredResult: "5-10%", referenceMethod: "IS 1528" },
              { parameter: "Passing 300 micron", requiredResult: "85-95%", referenceMethod: "IS 1528" }
            ]
          }
        ]
      },
      {
        standardName: "ASTM C778",
        grades: ["20/40", "30/60"],
        analyses: [
          {
            title: "Physical Analysis",
            parameters: [
              { parameter: "Color", requiredResult: "Off white", referenceMethod: "Visual" },
              { parameter: "Bulk Density", requiredResult: "1.45-1.65 g/cc", referenceMethod: "ASTM C128" }
            ]
          },
          {
            title: "Chemical Analysis",
            parameters: [
              { parameter: "SiO2", requiredResult: "Min 96.0%", referenceMethod: "ASTM D859" },
              { parameter: "Al2O3", requiredResult: "Max 1.5%", referenceMethod: "ASTM D6349" }
            ]
          },
          {
            title: "Sieve Analysis",
            parameters: [
              { parameter: "Retained on 850 micron", requiredResult: "0-2%", referenceMethod: "ASTM C136" },
              { parameter: "Passing 300 micron", requiredResult: "90-98%", referenceMethod: "ASTM C136" }
            ]
          }
        ]
      }
    ]
  },
  {
    tradeName: "Calcium Carbonate Powder",
    availableSizes: ["200 Mesh", "300 Mesh", "500 Mesh"],
    standards: [
      {
        standardName: "IS 8767",
        grades: ["200 Mesh", "300 Mesh"],
        analyses: [
          {
            title: "Physical Analysis",
            parameters: [
              { parameter: "Whiteness", requiredResult: "Min 92%", referenceMethod: "Reflectance Meter" },
              { parameter: "Brightness", requiredResult: "Min 94%", referenceMethod: "ISO 2470" }
            ]
          },
          {
            title: "Chemical Analysis",
            parameters: [
              { parameter: "CaCO3", requiredResult: "Min 97%", referenceMethod: "Titrimetric" },
              { parameter: "MgO", requiredResult: "Max 1.5%", referenceMethod: "IS 1760" }
            ]
          },
          {
            title: "Sieve Analysis",
            parameters: [
              { parameter: "Residue on 200 Mesh", requiredResult: "Max 1.0%", referenceMethod: "IS 460" },
              { parameter: "Residue on 300 Mesh", requiredResult: "Max 3.0%", referenceMethod: "IS 460" }
            ]
          }
        ]
      }
    ]
  }
];

module.exports = { customers, products };
