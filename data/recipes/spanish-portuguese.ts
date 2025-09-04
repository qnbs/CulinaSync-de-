import { Recipe } from '@/types';

export const spanishPortugueseRecipes: Recipe[] = [
  {
    recipeTitle: "Paella Valenciana (Originalrezept)",
    shortDescription: "Das authentische Nationalgericht aus Valencia. Safran-Reis, gekocht mit Huhn, Kaninchen und grünen Bohnen in einer großen, flachen Pfanne. Das Highlight ist der 'Socarrat' - eine köstliche, leicht angebratene Reiskruste am Boden der Pfanne.",
    prepTime: "30 Min.",
    cookTime: "45 Min.",
    totalTime: "1 Std. 15 Min.",
    servings: "6-8 Personen",
    difficulty: "Mittel",
    ingredients: [
        {
            sectionTitle: "Zutaten",
            items: [
                { quantity: "500", unit: "g", name: "Paella-Reis (Bomba oder Calasparra)" },
                { quantity: "1", unit: "Stk.", name: "Hähnchen, in Teilen" },
                { quantity: "0.5", unit: "Stk.", name: "Kaninchen, in Teilen" },
                { quantity: "200", unit: "g", name: "grüne Bohnen" },
                { quantity: "150", unit: "g", name: "Garrofó (weiße Riesenbohnen)" },
                { quantity: "1", unit: "Stk.", name: "reife Tomate, gerieben" },
                { quantity: "1.5", unit: "l", name: "Wasser oder Hühnerbrühe" },
                { quantity: "1", unit: "Briefchen", name: "Safranfäden" },
                { quantity: "1", unit: "TL", name: "geräuchertes Paprikapulver (Pimentón)" },
                { quantity: "", unit: "", name: "Olivenöl, Salz" }
            ]
        }
    ],
    instructions: [
        "Eine große, flache Paella-Pfanne mit Olivenöl erhitzen. Die gesalzenen Hähnchen- und Kaninchenteile darin bei mittlerer Hitze goldbraun anbraten. An den Rand der Pfanne schieben.",
        "In der Mitte der Pfanne die grünen Bohnen und die Garrofó-Bohnen anbraten.",
        "Die geriebene Tomate und das Paprikapulver in die Mitte geben und kurz mitrösten.",
        "Alles vermischen und mit dem heißen Wasser oder der Brühe ablöschen. Safran hinzufügen und alles aufkochen lassen. Ca. 20 Minuten köcheln lassen.",
        "Den Reis gleichmäßig in der Pfanne verteilen. Ab jetzt nicht mehr umrühren!",
        "Die Paella bei mittlerer Hitze ca. 10 Minuten kochen, dann die Hitze reduzieren und weitere 8-10 Minuten köcheln lassen, bis der Reis die gesamte Flüssigkeit aufgesogen hat.",
        "Für den 'Socarrat' die Hitze am Ende für ca. 1 Minute hochdrehen, bis es am Boden leicht knistert und duftet.",
        "Die Pfanne vom Herd nehmen, mit einem sauberen Küchentuch oder Alufolie abdecken und 5-10 Minuten ruhen lassen. Mit Zitronenspalten servieren."
    ],
    nutritionPerServing: { calories: "780 kcal", protein: "35 g", fat: "30 g", carbs: "85 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Spanisch"],
      occasion: ["Für Gäste", "Sommer"],
      mainIngredient: ["Huhn", "Reis"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Nicht umrühren!",
            content: "Sobald der Reis in der Pfanne ist, darf nicht mehr gerührt werden. Dies ist entscheidend, damit sich die Stärke gleichmäßig verteilt und am Boden der begehrte 'Socarrat' entstehen kann."
        }
    ]
  },
  {
    recipeTitle: "Tortilla Española (Spanisches Kartoffelomelett)",
    shortDescription: "Ein spanischer Nationalstolz und ein Klassiker jeder Tapas-Bar. Ein dickes, saftiges Omelett aus langsam in Olivenöl gegarten Kartoffeln und Zwiebeln, gebunden mit Eiern. Schmeckt warm als Hauptgericht oder kalt in Würfel geschnitten.",
    prepTime: "15 Min.",
    cookTime: "25 Min.",
    totalTime: "40 Min.",
    servings: "4-6 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "g", name: "festkochende Kartoffeln" },
            { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
            { quantity: "6", unit: "Stk.", name: "Eier" },
            { quantity: "200", unit: "ml", name: "Olivenöl" },
            { quantity: "", unit: "", name: "Salz" }
        ]
      }
    ],
    instructions: [
        "Die Kartoffeln schälen und in dünne, ungleichmäßige Scheiben schneiden. Die Zwiebel in feine Streifen schneiden.",
        "Das Olivenöl in einer beschichteten Pfanne (ca. 24 cm) bei mittlerer Hitze erwärmen. Kartoffeln und Zwiebeln hinzufügen und salzen.",
        "Die Kartoffeln und Zwiebeln im Öl bei niedriger bis mittlerer Hitze langsam garen, nicht braten. Sie sollten weich und confiert sein. Das dauert ca. 15-20 Minuten.",
        "In einer großen Schüssel die Eier verquirlen und kräftig salzen.",
        "Die gegarten Kartoffeln und Zwiebeln mit einem Schaumlöffel aus dem Öl heben und zur Eimischung geben. Das überschüssige Öl in der Pfanne lassen (ca. 2-3 EL). Gut vermischen und 5 Minuten ziehen lassen.",
        "Die Pfanne wieder erhitzen. Die Kartoffel-Ei-Mischung hineingeben und bei niedriger Hitze stocken lassen. Mit einem Spatel den Rand immer wieder lösen.",
        "Wenn die Unterseite goldbraun und die Oberfläche noch leicht flüssig ist, einen großen Teller auf die Pfanne legen und die Tortilla mit einer schnellen Bewegung wenden.",
        "Die Tortilla zurück in die Pfanne gleiten lassen und die andere Seite ebenfalls einige Minuten goldbraun backen. Die Mitte sollte noch saftig sein ('jugosa').",
        "Auf einen Teller gleiten lassen und vor dem Anschneiden kurz ruhen lassen."
    ],
    nutritionPerServing: { calories: "350 kcal", protein: "15 g", fat: "22 g", carbs: "24 g" },
    tags: {
      course: ["Hauptgericht", "Vorspeise"],
      cuisine: ["Spanisch"],
      occasion: ["Alltagsküche", "Party"],
      mainIngredient: ["Kartoffel", "Ei"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
        {
            title: "Der Wendepunkt",
            content: "Das Wenden der Tortilla erfordert etwas Mut. Verwenden Sie einen Teller, der größer als die Pfanne ist. Halten Sie ihn fest an die Pfanne gedrückt und wenden Sie beides mit einer schnellen, entschlossenen Bewegung."
        }
    ]
  },
  {
    recipeTitle: "Gazpacho Andaluz (Kalte Tomatensuppe)",
    shortDescription: "Eine erfrischende, ungekochte Gemüsesuppe aus Andalusien, perfekt für heiße Sommertage. Reife Tomaten, Gurke, Paprika und Knoblauch werden zu einer samtigen, kühlen Suppe püriert, die als Vorspeise oder leichtes Hauptgericht serviert wird.",
    prepTime: "15 Min.",
    cookTime: "0 Min.",
    totalTime: "15 Min. (+ mind. 1 Std. Kühlzeit)",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "kg", name: "reife Tomaten" },
            { quantity: "1", unit: "Stk.", name: "Salatgurke" },
            { quantity: "1", unit: "Stk.", name: "grüne Paprika" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Stk.", name: "Knoblauchzehe" },
            { quantity: "100", unit: "ml", name: "Olivenöl" },
            { quantity: "3", unit: "EL", name: "Sherry-Essig" }
        ]
      }
    ],
    instructions: [
        "Das Gemüse waschen und grob zerkleinern. Die Gurke schälen.",
        "Alle Gemüsesorten zusammen mit dem Knoblauch in einen leistungsstarken Mixer geben.",
        "Das Olivenöl, den Sherry-Essig und eine gute Prise Salz hinzufügen.",
        "Alles auf höchster Stufe mixen, bis eine glatte, homogene Suppe entsteht. Bei Bedarf etwas kaltes Wasser hinzufügen, um die gewünschte Konsistenz zu erreichen.",
        "Die Gazpacho durch ein feines Sieb passieren, um eine besonders samtige Textur zu erhalten.",
        "Die Suppe mit Salz und Essig abschmecken und für mindestens 1 Stunde im Kühlschrank kalt stellen.",
        "Kalt servieren, traditionell mit kleinen Schälchen mit Toppings wie fein gewürfelten Gurken, Paprika, Zwiebeln und Croutons."
    ],
    nutritionPerServing: { calories: "250 kcal", protein: "5 g", fat: "18 g", carbs: "20 g" },
    tags: {
      course: ["Vorspeise", "Hauptgericht"],
      cuisine: ["Spanisch"],
      occasion: ["Sommer"],
      mainIngredient: ["Gemüse"],
      prepMethod: ["Ohne Kochen"],
      diet: ["Vegan", "Vegetarisch"]
    },
    expertTips: [
        {
            title: "Die besten Tomaten",
            content: "Der Geschmack der Gazpacho hängt vollständig von der Qualität der Zutaten ab. Verwenden Sie die reifsten, aromatischsten Sommertomaten, die Sie finden können."
        }
    ]
  },
  {
    recipeTitle: "Patatas Bravas (mit authentischer Salsa Brava)",
    shortDescription: "Der unangefochtene König der spanischen Tapas-Bars. Knusprig frittierte Kartoffelwürfel, serviert mit einer pikanten, rauchigen Tomatensauce (Salsa Brava). Oft wird dazu eine cremige Knoblauch-Aioli gereicht.",
    prepTime: "15 Min.",
    cookTime: "20 Min.",
    totalTime: "35 Min.",
    servings: "4 Personen (als Tapa)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für die Kartoffeln",
        items: [
            { quantity: "500", unit: "g", name: "festkochende Kartoffeln" },
            { quantity: "", unit: "", name: "Olivenöl zum Frittieren" }
        ]
      },
      {
        sectionTitle: "Für die Salsa Brava",
        items: [
            { quantity: "200", unit: "g", name: "gehackte Tomaten" },
            { quantity: "1", unit: "TL", name: "scharfes Paprikapulver" },
            { quantity: "1", unit: "TL", name: "geräuchertes Paprikapulver" },
            { quantity: "1", unit: "Schuss", name: "Essig" },
            { quantity: "", unit: "", name: "Salz, Zucker" }
        ]
      }
    ],
    instructions: [
        "Für die Salsa Brava die Tomaten mit den beiden Paprikapulvern, Essig, einer Prise Salz und Zucker in einem kleinen Topf aufkochen. Die Hitze reduzieren und 10-15 Minuten köcheln lassen, bis die Sauce andickt. Anschließend glatt pürieren und beiseitestellen.",
        "Die Kartoffeln schälen und in unregelmäßige, ca. 2-3 cm große Würfel schneiden. In kaltem Wasser abspülen und sehr gut trocken tupfen.",
        "Reichlich Olivenöl in einer tiefen Pfanne oder Fritteuse auf 180°C erhitzen. Die Kartoffelwürfel portionsweise goldbraun und knusprig frittieren.",
        "Mit einem Schaumlöffel herausheben und auf Küchenpapier abtropfen lassen. Mit Salz bestreuen.",
        "Die heißen Kartoffeln sofort servieren, großzügig mit der Salsa Brava beträufelt."
    ],
    nutritionPerServing: { calories: "320 kcal", protein: "4 g", fat: "18 g", carbs: "35 g" },
    tags: {
      course: ["Vorspeise", "Beilage"],
      cuisine: ["Spanisch"],
      occasion: ["Party", "Sommer"],
      mainIngredient: ["Kartoffel"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegan", "Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
      {
        title: "Für extra knusprige Kartoffeln",
        content: "Für ein besonders knuspriges Ergebnis die Kartoffelwürfel zweimal frittieren. Zuerst bei niedrigerer Temperatur (ca. 140°C) garen, bis sie weich sind. Dann abkühlen lassen und kurz vor dem Servieren in heißem Öl (180°C) goldbraun und knusprig frittieren."
      },
      {
        title: "Mit Aioli servieren",
        content: "In vielen Regionen Spaniens werden Patatas Bravas mit einer Kombination aus Salsa Brava und cremiger Knoblauch-Aioli serviert. Das mildert die Schärfe und sorgt für einen tollen Kontrast."
      }
    ]
  },
];