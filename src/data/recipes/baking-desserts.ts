import { Recipe } from '@/types';

export const bakingDessertsRecipes: Recipe[] = [
  {
    recipeTitle: "The Ultimate Fudgy Brownies",
    shortDescription: "Das definitive Rezept für unglaublich saftige, dichte und intensiv schokoladige Brownies mit einer glänzenden, hauchdünnen Knusperkruste. Dieses Rezept verzichtet auf übermäßiges Aufgehen und zielt auf die perfekte 'fudgy' Textur ab, die im Mund schmilzt.",
    prepTime: "15 Min.",
    cookTime: "30 Min.",
    totalTime: "45 Min.",
    servings: "16 Brownies",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "200", unit: "g", name: "dunkle Schokolade (70%)" },
            { quantity: "150", unit: "g", name: "Butter" },
            { quantity: "250", unit: "g", name: "Zucker" },
            { quantity: "3", unit: "Stk.", name: "Eier" },
            { quantity: "100", unit: "g", name: "Mehl" },
            { quantity: "30", unit: "g", name: "Kakaopulver" },
            { quantity: "1", unit: "Prise", name: "Salz" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf 175°C Ober-/Unterhitze vorheizen. Eine quadratische Backform (ca. 20x20 cm) mit Backpapier auslegen.",
        "Schokolade und Butter zusammen über einem Wasserbad oder in der Mikrowelle schmelzen. Gut verrühren und leicht abkühlen lassen.",
        "In einer großen Schüssel die Eier mit dem Zucker mit einem Schneebesen nur so lange verrühren, bis sie gerade so vermischt sind. Nicht schaumig schlagen!",
        "Die leicht abgekühlte Schokoladen-Butter-Mischung unter die Eier-Zucker-Masse rühren.",
        "Mehl, Kakaopulver und Salz mischen und auf die Schokoladenmasse sieben. Mit einem Teigschaber nur so lange unterheben, bis keine Mehlstreifen mehr sichtbar sind.",
        "Den Teig in die vorbereitete Form füllen und glatt streichen.",
        "Ca. 25-30 Minuten backen. Die Brownies sind fertig, wenn ein an den Rand gestochenes Stäbchen mit feuchten Krümeln herauskommt, aber nicht mit flüssigem Teig. Die Mitte sollte noch sehr weich sein.",
        "In der Form vollständig auskühlen lassen, bevor sie in Stücke geschnitten werden. Das ist entscheidend für die 'fudgy' Konsistenz."
    ],
    nutritionPerServing: { calories: "370 kcal", protein: "4 g", fat: "21 g", carbs: "47 g" },
    tags: {
      course: ["Dessert"],
      cuisine: ["Amerikanisch"],
      occasion: ["Party", "Alltagsküche"],
      mainIngredient: ["Schokolade"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Die glänzende Kruste",
            content: "Die charakteristische, papierdünne und glänzende Kruste entsteht, indem man die Eier und den Zucker nicht schaumig schlägt, sondern nur kurz verrührt, und die geschmolzene Schokolade-Butter-Mischung noch warm (aber nicht heiß) unterrührt."
        }
    ]
  },
  {
    recipeTitle: "Bienenstich (einfache Variante)",
    shortDescription: "Ein schneller und unkomplizierter Bienenstich, der ohne Hefeteig auskommt. Ein lockerer Rührteig wird mit einer knusprigen Mandel-Karamell-Schicht gebacken und mit einer leichten Vanille-Sahne-Creme gefüllt. Perfekt für spontane Kaffeerunden.",
    prepTime: "20 Min.",
    cookTime: "30 Min.",
    totalTime: "50 Min. (+ Kühlzeit)",
    servings: "1 Kuchen (16 Stücke)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für den Teig",
        items: [
            { quantity: "150", unit: "g", name: "Mehl" },
            { quantity: "2", unit: "TL", name: "Backpulver" },
            { quantity: "100", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Päckchen", name: "Vanillezucker" },
            { quantity: "100", unit: "g", name: "weiche Butter" },
            { quantity: "2", unit: "Stk.", name: "Eier" }
        ]
      },
      {
        sectionTitle: "Für den Mandelbelag",
        items: [
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "50", unit: "g", name: "Zucker" },
            { quantity: "100", unit: "g", name: "Mandelblättchen" }
        ]
      },
      {
        sectionTitle: "Für die Füllung",
        items: [
            { quantity: "400", unit: "ml", name: "Schlagsahne" },
            { quantity: "1", unit: "Päckchen", name: "Vanillepuddingpulver (ohne Kochen)" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf 180°C vorheizen. Eine Springform (26 cm) einfetten.",
        "Für den Teig alle Zutaten in eine Schüssel geben und zu einem glatten Rührteig verarbeiten. Den Teig in die Form füllen.",
        "Für den Belag Butter und Zucker in einem kleinen Topf schmelzen. Die Mandelblättchen unterrühren und die Masse gleichmäßig auf dem Teig verteilen.",
        "Den Kuchen ca. 30 Minuten backen, bis der Mandelbelag goldbraun ist. Vollständig auskühlen lassen.",
        "Den ausgekühlten Kuchen waagerecht halbieren.",
        "Für die Füllung die kalte Sahne mit dem Puddingpulver nach Packungsanweisung steif schlagen.",
        "Die Creme auf dem unteren Boden verteilen, den Mandeldeckel darauflegen und leicht andrücken. Den Kuchen mindestens 1 Stunde kalt stellen."
    ],
    nutritionPerServing: { calories: "371 kcal", protein: "5 g", fat: "24 g", carbs: "34 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Deutsch"],
      occasion: [],
      mainIngredient: ["Mandel"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: []
  },
  {
    recipeTitle: "Chewy Chocolate Chip Cookies",
    shortDescription: "Amerikanische Cookies, wie sie sein sollen: Außen knusprig, innen weich und herrlich zäh ('chewy'). Das Geheimnis liegt im richtigen Verhältnis von braunem und weißem Zucker und der perfekten Backzeit.",
    prepTime: "15 Min.",
    cookTime: "12 Min.",
    totalTime: "27 Min. (+ Kühlzeit)",
    servings: "ca. 18 Cookies",
    difficulty: "Einfach",
    ingredients: [
        {
            sectionTitle: "Zutaten",
            items: [
                { quantity: "150", unit: "g", name: "Butter, geschmolzen" },
                { quantity: "150", unit: "g", name: "brauner Zucker" },
                { quantity: "50", unit: "g", name: "weißer Zucker" },
                { quantity: "1", unit: "Stk.", name: "Ei" },
                { quantity: "1", unit: "TL", name: "Vanilleextrakt" },
                { quantity: "200", unit: "g", name: "Mehl" },
                { quantity: "0.5", unit: "TL", name: "Backpulver" },
                { quantity: "150", unit: "g", name: "Schokoladenchips" }
            ]
        }
    ],
    instructions: [
        "Die geschmolzene Butter mit beiden Zuckersorten verrühren. Ei und Vanilleextrakt hinzufügen und gut vermischen.",
        "Mehl, Backpulver und Salz in einer separaten Schüssel mischen und dann zur Butter-Zucker-Mischung geben. Nur kurz verrühren, bis alles vermischt ist.",
        "Die Schokoladenchips unterheben.",
        "Den Teig abgedeckt für mindestens 30 Minuten (besser 1 Stunde) im Kühlschrank kalt stellen. Dieser Schritt ist wichtig für die 'chewy' Konsistenz.",
        "Den Backofen auf 180°C vorheizen. Backbleche mit Backpapier auslegen.",
        "Mit einem Löffel oder Eisportionierer walnussgroße Teigkugeln formen und mit genügend Abstand auf das Backblech setzen.",
        "Ca. 10-12 Minuten backen, bis die Ränder goldbraun sind, die Mitte aber noch sehr weich aussieht.",
        "Die Cookies einige Minuten auf dem heißen Blech ruhen lassen, bevor sie zum vollständigen Auskühlen auf ein Kuchengitter gesetzt werden."
    ],
    nutritionPerServing: { calories: "95 kcal", protein: "1 g", fat: "5 g", carbs: "12 g" },
    tags: {
      course: ["Dessert", "Snack"],
      cuisine: ["Amerikanisch"],
      occasion: [],
      mainIngredient: ["Schokolade"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Den Teig kühlen",
            content: "Das Kühlen des Teiges ist der entscheidende Schritt. Es verhindert, dass die Cookies im Ofen zu sehr zerlaufen, und sorgt für eine dichtere, zähere ('chewy') Konsistenz."
        }
    ]
  },
  {
    recipeTitle: "Einfache Butterplätzchen zum Ausstechen",
    shortDescription: "Das Grundrezept für klassische Weihnachtsplätzchen oder Gebäck für das ganze Jahr. Ein einfacher Mürbeteig, der sich perfekt ausrollen und ausstechen lässt. Ideal zum gemeinsamen Backen mit Kindern und zum kreativen Verzieren.",
    prepTime: "20 Min.",
    cookTime: "10 Min.",
    totalTime: "30 Min. (+ 60 Min. Kühlzeit)",
    servings: "ca. 50 Plätzchen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für den Teig",
        items: [
            { quantity: "250", unit: "g", name: "Mehl" },
            { quantity: "125", unit: "g", name: "kalte Butter, in Würfeln" },
            { quantity: "80", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Stk.", name: "Ei" }
        ]
      },
      {
        sectionTitle: "Für die Dekoration (optional)",
        items: [
            { quantity: "100", unit: "g", name: "Puderzucker" },
            { quantity: "2", unit: "EL", name: "Zitronensaft" },
            { quantity: "", unit: "", name: "Zuckerstreusel" }
        ]
      }
    ],
    instructions: [
        "Alle Zutaten für den Teig rasch zu einem glatten Mürbeteig verkneten. Zu einer Kugel formen, in Frischhaltefolie wickeln und für mindestens 60 Minuten im Kühlschrank kalt stellen.",
        "Den Backofen auf 180°C Ober-/Unterhitze vorheizen. Backbleche mit Backpapier auslegen.",
        "Den gekühlten Teig portionsweise auf einer leicht bemehlten Arbeitsfläche ca. 3 mm dick ausrollen.",
        "Mit beliebigen Förmchen Plätzchen ausstechen und auf die Backbleche legen.",
        "Im vorgeheizten Ofen ca. 8-10 Minuten backen, bis die Ränder leicht goldbraun sind.",
        "Die Plätzchen auf einem Kuchengitter vollständig auskühlen lassen.",
        "Für die Dekoration Puderzucker mit Zitronensaft zu einem dicken Guss verrühren. Die kalten Plätzchen damit bestreichen und nach Belieben mit Zuckerstreuseln verzieren."
    ],
    nutritionPerServing: { calories: "45 kcal", protein: "0.5 g", fat: "2 g", carbs: "7 g" },
    tags: {
      course: ["Dessert", "Snack"],
      cuisine: ["Deutsch"],
      occasion: ["Weihnachten", "Feiertage"],
      mainIngredient: [],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: []
  },
  {
    recipeTitle: "Brüsseler Waffeln (knusprig & luftig)",
    shortDescription: "Die klassische belgische Waffel: Außen goldbraun und knusprig, innen federleicht und luftig. Aus einem einfachen Rührteig schnell zubereitet. Traditionell warm mit Puderzucker, frischen Früchten und Sahne serviert.",
    prepTime: "10 Min.",
    cookTime: "20 Min.",
    totalTime: "30 Min.",
    servings: "ca. 8 Waffeln",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "125", unit: "g", name: "Butter, geschmolzen" },
            { quantity: "75", unit: "g", name: "Zucker" },
            { quantity: "3", unit: "Stk.", name: "Eier" },
            { quantity: "250", unit: "g", name: "Mehl" },
            { quantity: "200", unit: "ml", name: "Milch" },
            { quantity: "100", unit: "ml", name: "Mineralwasser mit Kohlensäure" }
        ]
      }
    ],
    instructions: [
        "Die Eier trennen. Das Eiweiß steif schlagen und beiseitestellen.",
        "In einer anderen Schüssel die Eigelbe mit dem Zucker schaumig rühren.",
        "Die geschmolzene, leicht abgekühlte Butter und die Milch unterrühren.",
        "Das Mehl sieben und kurz unter die Masse rühren, bis ein glatter Teig entsteht.",
        "Das Mineralwasser hinzufügen und kurz unterrühren.",
        "Zuletzt den Eischnee vorsichtig unter den Teig heben.",
        "Das Waffeleisen vorheizen und einfetten. Aus dem Teig nacheinander goldbraune Waffeln backen.",
        "Warm mit Puderzucker, frischen Beeren, Sahne oder belgischer Schokoladensauce servieren."
    ],
    nutritionPerServing: { calories: "287 kcal", protein: "6 g", fat: "16 g", carbs: "31 g" },
    tags: {
      course: ["Dessert", "Frühstück"],
      cuisine: ["Belgisch"],
      occasion: [],
      mainIngredient: ["Ei"],
      prepMethod: ["Waffeleisen"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Das Geheimnis der Luftigkeit",
            content: "Zwei Zutaten sind entscheidend für die luftige Textur: steif geschlagenes Eiweiß, das vorsichtig untergehoben wird, und kohlensäurehaltiges Mineralwasser, das den Teig zusätzlich auflockert."
        }
    ]
  },
  {
    recipeTitle: "Lütticher Waffeln (mit Perlzucker)",
    shortDescription: "Die süße und reichhaltige Spezialität aus Lüttich. Ein fester Hefeteig, angereichert mit Butter und dem charakteristischen Perlzucker, der beim Backen karamellisiert und für eine unwiderstelich knusprige Außenseite und einen weichen Kern sorgt.",
    prepTime: "20 Min.",
    cookTime: "20 Min.",
    totalTime: "40 Min. (+ 1.5 Std. Gehzeit)",
    servings: "ca. 10 Waffeln",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "g", name: "Mehl" },
            { quantity: "20", unit: "g", name: "frische Hefe" },
            { quantity: "200", unit: "ml", name: "lauwarme Milch" },
            { quantity: "2", unit: "Stk.", name: "Eier" },
            { quantity: "200", unit: "g", name: "weiche Butter" },
            { quantity: "200", unit: "g", name: "Perlzucker" }
        ]
      }
    ],
    instructions: [
        "Die Hefe in der lauwarmen Milch auflösen.",
        "Mehl, Zucker, Salz und die Ei-Milch-Mischung zu einem glatten Teig verkneten.",
        "Die weiche Butter nach und nach unterkneten, bis ein geschmeidiger Teig entsteht. Abgedeckt an einem warmen Ort 1 Stunde gehen lassen.",
        "Den Perlzucker vorsichtig unter den Teig kneten. Nicht zu lange kneten, damit sich der Zucker nicht auflöst.",
        "Den Teig in 10 gleich große Portionen teilen.",
        "Das Waffeleisen für belgische Waffeln vorheizen. Die Teigkugeln nacheinander goldbraun backen, bis der Zucker karamellisiert ist.",
        "Die Waffeln schmecken am besten pur und noch warm."
    ],
    nutritionPerServing: { calories: "442 kcal", protein: "5 g", fat: "22 g", carbs: "55 g" },
    tags: {
      course: ["Dessert", "Frühstück"],
      cuisine: ["Belgisch"],
      occasion: [],
      mainIngredient: [],
      prepMethod: ["Waffeleisen"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Reinigung des Waffeleisens",
            content: "Der karamellisierte Perlzucker kann am Waffeleisen kleben. Reinigen Sie es am besten, solange es noch warm ist, indem Sie ein feuchtes Tuch zwischen die Platten legen und den Dampf wirken lassen."
        }
    ]
  },
  {
    recipeTitle: "Klassische deutsche Pfannkuchen",
    shortDescription: "Dünne, eierbetonte Eierkuchen, wie man sie in Deutschland kennt. Ein einfaches Grundrezept, das sich sowohl für süße Füllungen wie Apfelmus oder Marmelade als auch für herzhafte Varianten eignet.",
    prepTime: "10 Min.",
    cookTime: "15 Min.",
    totalTime: "25 Min. (+ 30 Min. Ruhezeit)",
    servings: "4 Personen (ca. 8 Stück)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "250", unit: "g", name: "Mehl" },
            { quantity: "4", unit: "Stk.", name: "Eier" },
            { quantity: "500", unit: "ml", name: "Milch" },
            { quantity: "1", unit: "Prise", name: "Salz" },
            { quantity: "", unit: "", name: "Butter zum Ausbacken" }
        ]
      }
    ],
    instructions: [
        "Mehl, Eier, Milch und Salz in eine Schüssel geben und mit einem Schneebesen zu einem glatten, klümpchenfreien Teig verrühren.",
        "Den Teig abgedeckt für 30 Minuten bei Raumtemperatur quellen lassen.",
        "Eine beschichtete Pfanne erhitzen und etwas Butter darin schmelzen lassen.",
        "Eine Schöpfkelle Teig in die heiße Pfanne geben und durch Schwenken dünn verteilen.",
        "Den Pfannkuchen bei mittlerer Hitze von beiden Seiten goldbraun backen.",
        "Den Vorgang wiederholen, bis der gesamte Teig aufgebraucht ist.",
        "Süß mit Zimt und Zucker, Apfelmus oder Marmelade, oder herzhaft mit Käse und Schinken gefüllt servieren."
    ],
    nutritionPerServing: { calories: "410 kcal", protein: "12 g", fat: "22 g", carbs: "40 g" },
    tags: {
      course: ["Hauptgericht", "Dessert"],
      cuisine: ["Deutsch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Ei"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: []
  },
  {
    recipeTitle: "Fluffige American Pancakes",
    shortDescription: "Das klassische amerikanische Frühstück. Kleine, dicke und besonders fluffige Pfannkuchen, die durch Backpulver ihre Höhe bekommen. Traditionell werden sie gestapelt und mit einem Stück Butter und reichlich Ahornsirup serviert.",
    prepTime: "10 Min.",
    cookTime: "10 Min.",
    totalTime: "20 Min.",
    servings: "2-3 Personen (ca. 14 Pancakes)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "200", unit: "g", name: "Mehl" },
            { quantity: "2", unit: "TL", name: "Backpulver" },
            { quantity: "1", unit: "EL", name: "Zucker" },
            { quantity: "1", unit: "Stk.", name: "Ei" },
            { quantity: "250", unit: "ml", name: "Milch" },
            { quantity: "2", unit: "EL", name: "geschmolzene Butter" }
        ]
      }
    ],
    instructions: [
        "In einer Schüssel die trockenen Zutaten (Mehl, Backpulver, Zucker, Salz) vermischen.",
        "In einer zweiten Schüssel das Ei verquirlen, dann Milch und geschmolzene Butter hinzufügen.",
        "Die flüssigen Zutaten zu den trockenen geben und nur kurz verrühren, bis alles vermischt ist. Einige Klümpchen im Teig sind in Ordnung und sogar erwünscht.",
        "Eine beschichtete Pfanne bei mittlerer Hitze erwärmen. Mit etwas Butter oder Öl auspinseln.",
        "Für jeden Pancake eine kleine Kelle Teig in die Pfanne geben.",
        "Backen, bis an der Oberfläche Blasen entstehen und der Rand fest wird. Dann wenden und die andere Seite goldbraun backen.",
        "Warm mit Ahornsirup und einem Stück Butter servieren."
    ],
    nutritionPerServing: { calories: "138 kcal", protein: "2.5 g", fat: "5.2 g", carbs: "20 g" },
    tags: {
      course: ["Frühstück"],
      cuisine: ["Amerikanisch"],
      occasion: [],
      mainIngredient: ["Mehl"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Den Teig nicht übermixen",
            content: "Der Schlüssel zu fluffigen Pancakes ist, den Teig nicht zu lange zu rühren. Sobald die trockenen und nassen Zutaten kombiniert sind, aufhören. Zu viel Rühren entwickelt das Gluten und macht die Pancakes zäh."
        }
    ]
  },
  {
    recipeTitle: "Hauchdünne französische Crêpes",
    shortDescription: "Der französische Klassiker, hauchdünn und zart. Dieses Grundrezept für Crêpes-Teig ist die perfekte Basis für süße Füllungen wie Zucker und Zimt oder Nutella, aber auch für herzhafte Varianten wie Schinken und Käse (Galettes).",
    prepTime: "10 Min.",
    cookTime: "15 Min.",
    totalTime: "25 Min. (+ 30 Min. Ruhezeit)",
    servings: "ca. 8-10 Crêpes",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "125", unit: "g", name: "Mehl" },
            { quantity: "2", unit: "Stk.", name: "Eier" },
            { quantity: "250", unit: "ml", name: "Milch" },
            { quantity: "2", unit: "EL", name: "geschmolzene Butter" },
            { quantity: "1", unit: "Prise", name: "Salz" }
        ]
      }
    ],
    instructions: [
        "Mehl und Salz in eine Schüssel sieben. In der Mitte eine Mulde formen.",
        "Die Eier in die Mulde schlagen und mit einem Schneebesen langsam von der Mitte aus das Mehl einarbeiten.",
        "Nach und nach die Milch unter ständigem Rühren hinzufügen, bis ein glatter, sehr flüssiger Teig entsteht.",
        "Zum Schluss die geschmolzene Butter unterrühren.",
        "Den Teig abgedeckt mindestens 30 Minuten im Kühlschrank ruhen lassen.",
        "Eine Crêpe-Pfanne oder eine große beschichtete Pfanne erhitzen und dünn mit Butter auspinseln.",
        "Eine kleine Kelle Teig in die heiße Pfanne geben und durch schnelles Schwenken hauchdünn verteilen.",
        "Den Crêpe von beiden Seiten kurz goldbraun backen und auf einen Teller gleiten lassen. Mit den restlichen Crêpes ebenso verfahren."
    ],
    nutritionPerServing: { calories: "155 kcal", protein: "4 g", fat: "9 g", carbs: "13 g" },
    tags: {
      course: ["Hauptgericht", "Dessert"],
      cuisine: ["Französisch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Ei"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Den Teig ruhen lassen",
            content: "Das Ruhen des Teiges ist wichtig. Es ermöglicht dem Mehl, die Flüssigkeit vollständig aufzunehmen, was zu zarteren und weniger gummiartigen Crêpes führt."
        }
    ]
  }
];