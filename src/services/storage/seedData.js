// Modelos comerciales reales; precios, inventario y configuraciones son de demostración.
// No son cotizaciones actuales ni afirman disponibilidad o afiliación con los fabricantes.
export const categories = [
  { id: 'computers', name: 'Computadoras ensambladas' },
  { id: 'motherboards', name: 'Placas madre' },
  { id: 'graphics', name: 'Tarjetas gráficas' },
  { id: 'processors', name: 'Procesadores' },
];

const graphics = [
  ['NVIDIA', 'GeForce RTX 4060', 299, 8],
  ['NVIDIA', 'GeForce RTX 4060 Ti 8 GB', 399, 8],
  ['NVIDIA', 'GeForce RTX 4060 Ti 16 GB', 449, 16],
  ['NVIDIA', 'GeForce RTX 4070', 549, 12],
  ['NVIDIA', 'GeForce RTX 4070 SUPER', 599, 12],
  ['NVIDIA', 'GeForce RTX 4070 Ti SUPER', 799, 16],
  ['NVIDIA', 'GeForce RTX 4080 SUPER', 999, 16],
  ['NVIDIA', 'GeForce RTX 4090', 1599, 24],
  ['NVIDIA', 'GeForce RTX 3060 12 GB', 279, 12],
  ['NVIDIA', 'GeForce RTX 3060 Ti', 349, 8],
  ['NVIDIA', 'GeForce RTX 3070', 399, 8],
  ['NVIDIA', 'GeForce RTX 3080 10 GB', 599, 10],
  ['AMD', 'Radeon RX 6600', 199, 8],
  ['AMD', 'Radeon RX 6650 XT', 239, 8],
  ['AMD', 'Radeon RX 6700 XT', 329, 12],
  ['AMD', 'Radeon RX 6750 XT', 349, 12],
  ['AMD', 'Radeon RX 6800', 399, 16],
  ['AMD', 'Radeon RX 7600', 269, 8],
  ['AMD', 'Radeon RX 7600 XT', 329, 16],
  ['AMD', 'Radeon RX 7700 XT', 419, 12],
  ['AMD', 'Radeon RX 7800 XT', 499, 16],
  ['AMD', 'Radeon RX 7900 GRE', 549, 16],
  ['AMD', 'Radeon RX 7900 XT', 749, 20],
  ['AMD', 'Radeon RX 7900 XTX', 949, 24],
];

const processors = [
  ['AMD', 'Ryzen 5 5500', 89, 'AM4', 6],
  ['AMD', 'Ryzen 5 5600', 119, 'AM4', 6],
  ['AMD', 'Ryzen 5 5600X', 139, 'AM4', 6],
  ['AMD', 'Ryzen 7 5700X', 169, 'AM4', 8],
  ['AMD', 'Ryzen 7 5700X3D', 229, 'AM4', 8],
  ['AMD', 'Ryzen 7 5800X', 199, 'AM4', 8],
  ['AMD', 'Ryzen 9 5900X', 269, 'AM4', 12],
  ['AMD', 'Ryzen 5 7600', 199, 'AM5', 6],
  ['AMD', 'Ryzen 5 7600X', 219, 'AM5', 6],
  ['AMD', 'Ryzen 7 7700', 289, 'AM5', 8],
  ['AMD', 'Ryzen 7 7700X', 309, 'AM5', 8],
  ['AMD', 'Ryzen 7 7800X3D', 399, 'AM5', 8],
  ['AMD', 'Ryzen 9 7900X', 379, 'AM5', 12],
  ['AMD', 'Ryzen 9 7950X', 549, 'AM5', 16],
  ['Intel', 'Core i3-12100F', 89, 'LGA1700', 4],
  ['Intel', 'Core i5-12400F', 129, 'LGA1700', 6],
  ['Intel', 'Core i5-12600K', 189, 'LGA1700', 10],
  ['Intel', 'Core i7-12700K', 259, 'LGA1700', 12],
  ['Intel', 'Core i5-13400F', 179, 'LGA1700', 10],
  ['Intel', 'Core i5-13600K', 279, 'LGA1700', 14],
  ['Intel', 'Core i7-13700K', 349, 'LGA1700', 16],
  ['Intel', 'Core i5-14600K', 299, 'LGA1700', 14],
  ['Intel', 'Core i7-14700K', 399, 'LGA1700', 20],
  ['Intel', 'Core i9-14900K', 549, 'LGA1700', 24],
];

const motherboards = [
  ['ASUS', 'PRIME B450M-A II', 89, 'AM4', 'B450', 'DDR4'],
  ['ASUS', 'TUF GAMING B550-PLUS', 149, 'AM4', 'B550', 'DDR4'],
  ['ASUS', 'ROG STRIX B550-F GAMING', 179, 'AM4', 'B550', 'DDR4'],
  ['MSI', 'B450 TOMAHAWK MAX II', 109, 'AM4', 'B450', 'DDR4'],
  ['MSI', 'B550M PRO-VDH WIFI', 119, 'AM4', 'B550', 'DDR4'],
  ['MSI', 'MAG B550 TOMAHAWK', 159, 'AM4', 'B550', 'DDR4'],
  ['Gigabyte', 'B550 AORUS ELITE V2', 149, 'AM4', 'B550', 'DDR4'],
  ['ASRock', 'B550M Pro4', 109, 'AM4', 'B550', 'DDR4'],
  ['ASUS', 'PRIME B650-PLUS', 189, 'AM5', 'B650', 'DDR5'],
  ['ASUS', 'TUF GAMING B650-PLUS WIFI', 229, 'AM5', 'B650', 'DDR5'],
  ['ASUS', 'ROG STRIX B650E-F GAMING WIFI', 289, 'AM5', 'B650E', 'DDR5'],
  ['MSI', 'PRO B650-P WIFI', 189, 'AM5', 'B650', 'DDR5'],
  ['MSI', 'MAG B650 TOMAHAWK WIFI', 229, 'AM5', 'B650', 'DDR5'],
  ['Gigabyte', 'B650 AORUS ELITE AX', 219, 'AM5', 'B650', 'DDR5'],
  ['ASRock', 'B650M Pro RS', 149, 'AM5', 'B650', 'DDR5'],
  ['ASRock', 'X670E Steel Legend', 299, 'AM5', 'X670E', 'DDR5'],
  ['ASUS', 'PRIME B660M-A D4', 139, 'LGA1700', 'B660', 'DDR4'],
  ['ASUS', 'TUF GAMING B760-PLUS WIFI D4', 189, 'LGA1700', 'B760', 'DDR4'],
  ['ASUS', 'ROG STRIX Z790-E GAMING WIFI', 449, 'LGA1700', 'Z790', 'DDR5'],
  ['MSI', 'PRO B760M-A WIFI DDR4', 149, 'LGA1700', 'B760', 'DDR4'],
  ['MSI', 'MAG Z790 TOMAHAWK WIFI', 279, 'LGA1700', 'Z790', 'DDR5'],
  ['Gigabyte', 'B760 GAMING X AX', 179, 'LGA1700', 'B760', 'DDR5'],
  ['Gigabyte', 'Z790 AORUS ELITE AX', 269, 'LGA1700', 'Z790', 'DDR5'],
  ['ASRock', 'B760 Pro RS', 159, 'LGA1700', 'B760', 'DDR5'],
];

// Familias reales de equipos. Su configuración varía por SKU/región; no inferimos componentes.
const computers = [
  ['Dell', 'XPS Desktop 8960', 1399],
  ['Alienware', 'Aurora R16', 1799],
  ['HP', 'OMEN 25L', 1099],
  ['HP', 'OMEN 40L', 1599],
  ['Lenovo', 'Legion Tower 5i Gen 8', 1299],
  ['Lenovo', 'Legion Tower 7i Gen 8', 1999],
  ['MSI', 'MAG Infinite S3 14th', 1199],
  ['ASUS', 'ROG G16CH', 1499],
];

function product(categoryId, row, index, specs) {
  const [brand, model, dollars] = row;
  return {
    id: `${categoryId}-${String(index + 1).padStart(3, '0')}`,
    name: `${brand} ${model}`,
    brand,
    categoryId,
    description: `Modelo comercial ${brand} ${model}. Precio e inventario ficticios para la demo académica. Verificar la ficha del fabricante y el SKU antes de una compra real.`,
    priceCents: dollars * 100,
    currency: 'USD',
    priceNote: 'Precio referencial de demostración; no es una cotización actual.',
    stock: [12, 8, 4, 0, 16, 3, 7, 5][index % 8],
    active: true,
    image: null,
    specs,
  };
}

export function createSeedData() {
  return {
    version: 1,
    revision: 0,
    Products: [
      ...computers.map((row, i) => product('computers', row, i, { type: 'Equipo ensamblado', configuration: 'Consultar SKU; la configuración varía por región.' })),
      ...motherboards.map((row, i) => product('motherboards', row, i, { socket: row[3], chipset: row[4], memory: row[5] })),
      ...graphics.map((row, i) => product('graphics', row, i, { vramGB: row[3] })),
      ...processors.map((row, i) => product('processors', row, i, { socket: row[3], cores: row[4] })),
    ],
    Categories: structuredClone(categories),
    Customers: [],
    Orders: [],
    Session: null,
  };
}
