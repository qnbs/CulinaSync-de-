import { Recipe } from '@/types';

export const internationalRecipes: Recipe[] = [
  {
    recipeTitle: "Chili con Carne (Tex-Mex Original)",
    shortDescription: "Ein authentisches Tex-Mex-Chili, das seinen Namen verdient. Anstelle von Hackfleisch werden zarte Rindfleischwürfel langsam in einer tiefroten, rauchigen Sauce aus echten getrockneten Chilis geschmort. Ein intensives, komplexes und wärmendes Gericht, das weit über die bekannte Alltagsversion hinausgeht.",
    prepTime: "30 Min.",
    cookTime: "2 Std. 30 Min.",
    totalTime: "3 Std.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
        {
            sectionTitle: "Zutaten",
            items: [
                { quantity: "1", unit: "kg", name: "Rindfleisch (Schulter), gewürfelt" },
                { quantity: "3", unit: "Stk.", name: "Ancho-Chilis, getrocknet" },
                { quantity: "2", unit: "Stk.", name: "Guajillo-Chilis, getrocknet" },
                { quantity: "2", unit: "Stk.", name: "Zwiebeln" },
                { quantity: "4", unit: "Stk.", name: "Knoblauchzehen" },
                { quantity: "1", unit: "Dose", name: "gehackte Tomaten" },
                { quantity: "1", unit: "Dose", name: "Kidneybohnen" },
                { quantity: "1", unit: "EL", name: "Kreuzkümmel, gemahlen" }
            ]
        }
    ],
    instructions: [
        "Die getrockneten Chilis von Stielen und Samen befreien. In einer trockenen Pfanne kurz anrösten, bis sie duften. Mit heißem Wasser übergießen und 30 Minuten einweichen.",
        "Die eingeweichten Chilis mit etwas Einweichwasser in einem Mixer zu einer glatten Paste pürieren.",
        "Das Rindfleisch portionsweise in einem großen Schmortopf scharf anbraten und herausnehmen.",
        "Die gewürfelten Zwiebeln im selben Topf anbraten. Knoblauch hinzufügen und kurz mitbraten.",
        "Das Fleisch zurück in den Topf geben. Die Chili-Paste, Kreuzkümmel und die gehackten Tomaten hinzufügen.",
        "Mit so viel Wasser oder Rinderbrühe auffüllen, dass das Fleisch bedeckt ist. Aufkochen und dann bei schwacher Hitze zugedeckt 2,5 bis 3 Stunden schmoren lassen, bis das Fleisch butterzart ist.",
        "Die Kidneybohnen abspülen und in der letzten halben Stunde zum Chili geben.",
        "Mit Salz und Pfeffer abschmecken. Mit Toppings wie saurer Sahne, geriebenem Käse, frischem Koriander und Jalapeños servieren."
    ],
    nutritionPerServing: { calories: "372 kcal", protein: "25.5 g", fat: "9.3 g", carbs: "41.3 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Mexikanisch", "Amerikanisch"],
      occasion: ["Party", "Winter"],
      mainIngredient: ["Rind"],
      prepMethod: ["One-Pot"],
      diet: []
    },
    expertTips: [
        {
            title: "Geheimzutat",
            content: "Fügen Sie am Ende ein kleines Stück dunkle Schokolade oder einen Löffel ungesüßtes Kakaopulver hinzu. Dies verleiht dem Chili eine unglaubliche Tiefe und Komplexität, ohne dass es süß schmeckt."
        }
    ]
  },
  {
    recipeTitle: "Shepherd's Pie (Original mit Lamm)",
    shortDescription: "Der Inbegriff britischen und irischen Comfort Foods. Eine herzhafte Füllung aus Lammhackfleisch, das mit Gemüse in einer reichhaltigen Sauce geschmort wird, bedeckt von einer cremigen, goldbraun überbackenen Haube aus Kartoffelpüree.",
    prepTime: "25 Min.",
    cookTime: "50 Min.",
    totalTime: "1 Std. 15 Min.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Füllung",
        items: [
            { quantity: "500", unit: "g", name: "Lammhackfleisch" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "2", unit: "Stk.", name: "Karotten" },
            { quantity: "100", unit: "g", name: "Erbsen (TK)" },
            { quantity: "400", unit: "ml", name: "Lamm- oder Rinderfond" },
            { quantity: "1", unit: "EL", name: "Tomatenmark" },
            { quantity: "1", unit: "EL", name: "Worcestershiresauce" }
        ]
      },
      {
        sectionTitle: "Für das Kartoffelpüree",
        items: [
            { quantity: "1", unit: "kg", name: "mehlig kochende Kartoffeln" },
            { quantity: "100", unit: "ml", name: "Milch" },
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "1", unit: "Stk.", name: "Eigelb" }
        ]
      }
    ],
    instructions: [
        "Die Kartoffeln schälen, würfeln und in Salzwasser weich kochen. Abgießen, ausdampfen lassen und mit warmer Milch und Butter zu einem glatten Püree stampfen. Das Eigelb unterrühren und mit Salz, Pfeffer und Muskatnuss abschmecken.",
        "Den Backofen auf 200°C vorheizen. Zwiebel und Karotten fein würfeln.",
        "Das Lammhackfleisch in einem heißen Topf krümelig anbraten. Zwiebeln und Karotten hinzufügen und mitbraten.",
        "Tomatenmark und Mehl zugeben, kurz anschwitzen. Mit dem Fond und der Worcestershiresauce ablöschen. Aufkochen und ca. 15 Minuten köcheln lassen, bis die Sauce andickt.",
        "Die gefrorenen Erbsen unterrühren und die Füllung kräftig mit Salz und Pfeffer abschmecken.",
        "Die Hackfleischfüllung in eine Auflaufform geben.",
        "Das Kartoffelpüree gleichmäßig auf der Füllung verteilen. Mit einer Gabel ein Muster auf der Oberfläche ziehen.",
        "Im vorgeheizten Ofen ca. 25-30 Minuten backen, bis die Oberfläche goldbraun und knusprig ist."
    ],
    nutritionPerServing: { calories: "677 kcal", protein: "38 g", fat: "39 g", carbs: "40 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Britisch", "Irisch"],
      occasion: ["Alltagsküche", "Winter"],
      mainIngredient: ["Lamm", "Kartoffel"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Cottage Pie vs. Shepherd's Pie",
            content: "Technisch gesehen wird dieses Gericht zu einem 'Cottage Pie', wenn Sie Rindfleisch anstelle von Lamm verwenden. Beide Varianten sind köstlich!"
        }
    ]
  },
  {
    recipeTitle: "Griechisches Moussaka",
    shortDescription: "Ein herzhafter und cremiger Auflauf, der als griechisches Nationalgericht gilt. Schichten aus gebratenen Auberginen, Kartoffeln und einer würzigen Lamm- oder Rinderhackfleischsauce mit Zimt, gekrönt von einer reichhaltigen Béchamelsauce und im Ofen goldbraun gebacken.",
    prepTime: "45 Min.",
    cookTime: "1 Std. 20 Min.",
    totalTime: "2 Std. 5 Min.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Gemüseschichten",
        items: [
            { quantity: "2", unit: "Stk.", name: "große Auberginen" },
            { quantity: "500", unit: "g", name: "Kartoffeln" }
        ]
      },
      {
        sectionTitle: "Für die Hackfleischsauce",
        items: [
            { quantity: "500", unit: "g", name: "Lammhackfleisch" },
            { quantity: "1", unit: "Dose", name: "gehackte Tomaten" },
            { quantity: "1", unit: "TL", name: "Zimt" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" }
        ]
      },
      {
        sectionTitle: "Für die Béchamelsauce",
        items: [
            { quantity: "1", unit: "l", name: "Milch" },
            { quantity: "100", unit: "g", name: "Butter" },
            { quantity: "100", unit: "g", name: "Mehl" },
            { quantity: "2", unit: "Stk.", name: "Eigelb" }
        ]
      }
    ],
    instructions: [
        "Auberginen und Kartoffeln in Scheiben schneiden. Auberginen salzen und 30 Min. Wasser ziehen lassen, dann trocken tupfen. Beides in Olivenöl anbraten oder im Ofen rösten, bis es weich ist.",
        "Für die Hackfleischsauce die gehackte Zwiebel anbraten, Hackfleisch zugeben und krümelig braten. Tomaten, Zimt, Salz und Pfeffer hinzufügen und 20 Minuten köcheln lassen.",
        "Für die Béchamel die Butter schmelzen, Mehl einrühren und anschwitzen. Langsam die Milch unter Rühren zugeben, bis eine dicke Sauce entsteht. Vom Herd nehmen, Eigelbe und geriebenen Käse (optional) unterrühren. Mit Salz, Pfeffer und Muskatnuss abschmecken.",
        "Den Ofen auf 180°C vorheizen. Eine Auflaufform schichten: zuerst eine Lage Kartoffeln, dann Auberginen, dann die Hackfleischsauce. Vorgang wiederholen.",
        "Die Béchamelsauce als oberste Schicht gleichmäßig verteilen.",
        "Im Ofen ca. 45-50 Minuten backen, bis die Oberfläche goldbraun ist.",
        "Vor dem Anschneiden 15 Minuten ruhen lassen."
    ],
    nutritionPerServing: { calories: "898 kcal", protein: "49 g", fat: "60 g", carbs: "40 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Griechisch"],
      occasion: ["Für Gäste", "Festessen"],
      mainIngredient: ["Hackfleisch", "Gemüse"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: []
  },
  {
    recipeTitle: "Hähnchen-Souvlaki mit Tzatziki",
    shortDescription: "Der griechische Grill-Klassiker. Saftige Hähnchenstücke, mariniert in Zitrone, Knoblauch und Oregano, auf Spießen gegrillt und mit cremigem, hausgemachtem Tzatziki serviert. Perfekt für den Grillabend oder als schnelle Mahlzeit in Pita-Brot.",
    prepTime: "20 Min. (+ mind. 1 Std. Marinierzeit)",
    cookTime: "10 Min.",
    totalTime: "30 Min. (+ Marinierzeit)",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für die Souvlaki",
        items: [
            { quantity: "600", unit: "g", name: "Hähnchenbrust" },
            { quantity: "1", unit: "Stk.", name: "Zitrone (Saft und Abrieb)" },
            { quantity: "3", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "2", unit: "EL", name: "Olivenöl" },
            { quantity: "1", unit: "EL", name: "getrockneter Oregano" }
        ]
      },
      {
        sectionTitle: "Für das Tzatziki",
        items: [
            { quantity: "1", unit: "Stk.", name: "Salatgurke" },
            { quantity: "500", unit: "g", name: "griechischer Joghurt" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" }
        ]
      },
      {
        sectionTitle: "Zum Servieren",
        items: [
            { quantity: "4", unit: "Stk.", name: "Pita-Brote" },
            { quantity: "", unit: "", name: "Tomaten, Zwiebeln, Salat" }
        ]
      }
    ],
    instructions: [
        "Für das Tzatziki die Gurke grob reiben, salzen und 15 Minuten Wasser ziehen lassen. Dann gut ausdrücken. Mit Joghurt, gepresstem Knoblauch und einem Schuss Olivenöl vermischen. Mit Salz und Pfeffer abschmecken.",
        "Für die Souvlaki das Hähnchen in mundgerechte Würfel schneiden. Mit Zitronensaft, -abrieb, gepresstem Knoblauch, Olivenöl, Oregano, Salz und Pfeffer vermischen. Mindestens 1 Stunde marinieren.",
        "Die marinierten Hähnchenwürfel auf Holz- oder Metallspieße stecken.",
        "Die Spieße auf dem heißen Grill oder in einer Grillpfanne von allen Seiten ca. 8-10 Minuten grillen, bis sie gar und leicht gebräunt sind.",
        "Die warmen Pita-Brote mit Salat, Tomaten und Zwiebeln füllen, die Hähnchenspieße darauflegen (Spieß entfernen) und mit reichlich Tzatziki servieren."
    ],
    nutritionPerServing: { calories: "455 kcal", protein: "55 g", fat: "14 g", carbs: "25 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Griechisch"],
      occasion: ["Grillen", "Sommer"],
      mainIngredient: ["Huhn"],
      prepMethod: ["Grill", "Pfannengericht"],
      diet: []
    },
    expertTips: []
  },
  {
    recipeTitle: "Tacos al Pastor",
    shortDescription: "Ein legendäres Streetfood-Gericht aus Mexiko-Stadt. Dünn geschnittenes, mariniertes Schweinefleisch wird traditionell am vertikalen Spieß gegrillt und in kleinen Maistortillas mit Ananas, Zwiebeln und Koriander serviert. Hier eine authentische Variante für Pfanne oder Grill.",
    prepTime: "30 Min. (+ mind. 4 Std. Marinierzeit)",
    cookTime: "20 Min.",
    totalTime: "50 Min. (+ Marinierzeit)",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Marinade",
        items: [
            { quantity: "500", unit: "g", name: "Schweinefleisch (Nacken)" },
            { quantity: "2", unit: "Stk.", name: "Ancho-Chilis, getrocknet" },
            { quantity: "100", unit: "ml", name: "Ananassaft" },
            { quantity: "2", unit: "EL", name: "Achiote-Paste" }
        ]
      },
      {
        sectionTitle: "Für die Tacos",
        items: [
            { quantity: "12", unit: "Stk.", name: "kleine Maistortillas" },
            { quantity: "1", unit: "Stk.", name: "Ananas, frisch" },
            { quantity: "1", unit: "Stk.", name: "weiße Zwiebel" },
            { quantity: "1", unit: "Bund", name: "Koriander" }
        ]
      }
    ],
    instructions: [
        "Das Schweinefleisch in sehr dünne Scheiben schneiden. Die getrockneten Chilis einweichen und mit Ananassaft, Achiote-Paste und Gewürzen zu einer Marinade pürieren.",
        "Das Fleisch mit der Marinade vermischen und mindestens 4 Stunden (besser über Nacht) im Kühlschrank ziehen lassen.",
        "Eine Grillpfanne oder einen Grill stark erhitzen. Das marinierte Fleisch portionsweise scharf anbraten, bis es gar ist und knusprige Ränder hat. Vom Herd nehmen und klein hacken.",
        "Die Ananas in kleine Würfel schneiden und kurz in der Pfanne karamellisieren.",
        "Die Maistortillas in einer trockenen Pfanne erwärmen.",
        "Jeden Taco mit dem gehackten Fleisch, Ananaswürfeln, fein gehackter Zwiebel und frischem Koriander belegen. Mit Limettenspalten servieren."
    ],
    nutritionPerServing: { calories: "423 kcal", protein: "34 g", fat: "14 g", carbs: "40 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Mexikanisch"],
      occasion: ["Party", "Grillen"],
      mainIngredient: ["Schwein"],
      prepMethod: ["Pfannengericht", "Grill"],
      diet: []
    },
    expertTips: []
  },
  {
    recipeTitle: "Enchiladas Verdes",
    shortDescription: "Ein klassisches mexikanisches Wohlfühlessen. Weiche Maistortillas, gefüllt mit saftigem Hähnchenfleisch, werden mit einer hausgemachten, frisch-säuerlichen Salsa Verde aus Tomatillos übergossen und mit Käse überbacken.",
    prepTime: "25 Min.",
    cookTime: "30 Min.",
    totalTime: "55 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "g", name: "Tomatillos" },
            { quantity: "1", unit: "Stk.", name: "Jalapeño-Chili" },
            { quantity: "12", unit: "Stk.", name: "Maistortillas" },
            { quantity: "300", unit: "g", name: "gekochtes Hähnchenfleisch, zerzupft" },
            { quantity: "200", unit: "g", name: "Käse (z.B. Monterey Jack), gerieben" }
        ]
      }
    ],
    instructions: [
        "Den Ofen auf 190°C vorheizen. Tomatillos, Zwiebel und Jalapeño auf einem Backblech rösten, bis sie weich und leicht gebräunt sind.",
        "Das geröstete Gemüse mit Koriander, Knoblauch und etwas Wasser zu einer glatten Salsa Verde pürieren. Mit Salz abschmecken.",
        "Die Maistortillas kurz in heißem Öl erwärmen, um sie biegsam zu machen.",
        "Jede Tortilla mit dem zerzupften Hähnchenfleisch füllen, aufrollen und mit der Naht nach unten in eine Auflaufform legen.",
        "Die Enchiladas großzügig mit der Salsa Verde übergießen und mit dem Käse bestreuen.",
        "Im Ofen 20-25 Minuten backen, bis die Soße blubbert und der Käse goldbraun ist.",
        "Mit Toppings wie saurer Sahne, Avocado und frischem Koriander servieren."
    ],
    nutritionPerServing: { calories: "690 kcal", protein: "26 g", fat: "20 g", carbs: "105 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Mexikanisch"],
      occasion: ["Wochenende"],
      mainIngredient: ["Huhn", "Gemüse"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: []
  },
  {
    recipeTitle: "Authentische Guacamole",
    shortDescription: "Der weltberühmte mexikanische Avocado-Dip, einfach und puristisch zubereitet. Cremige, reife Avocados werden mit Limettensaft, Zwiebeln, Koriander und einem Hauch Schärfe zu einem frischen Dip zerdrückt.",
    prepTime: "10 Min.",
    cookTime: "0 Min.",
    totalTime: "10 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "3", unit: "Stk.", name: "reife Avocados" },
            { quantity: "1", unit: "Stk.", name: "Limette (Saft)" },
            { quantity: "0.5", unit: "Stk.", name: "rote Zwiebel, fein gewürfelt" },
            { quantity: "1", unit: "Handvoll", name: "frischer Koriander, gehackt" },
            { quantity: "1", unit: "Stk.", name: "Serrano-Chili, entkernt und fein gehackt" }
        ]
      }
    ],
    instructions: [
        "Die Avocados halbieren, den Kern entfernen und das Fruchtfleisch mit einem Löffel in eine Schüssel geben.",
        "Sofort den Limettensaft hinzufügen, um eine Oxidation (Braunwerden) zu verhindern.",
        "Die Avocado mit einer Gabel grob zerdrücken, es sollten noch Stücke erhalten bleiben.",
        "Die fein gewürfelte Zwiebel, den gehackten Koriander und die Chili hinzufügen.",
        "Alles vorsichtig vermischen und mit Salz abschmecken.",
        "Sofort mit Tortilla-Chips servieren."
    ],
    nutritionPerServing: { calories: "150 kcal", protein: "2 g", fat: "14 g", carbs: "8 g" },
    tags: {
      course: ["Vorspeise", "Snack"],
      cuisine: ["Mexikanisch"],
      occasion: ["Party", "Grillen"],
      mainIngredient: ["Gemüse"],
      prepMethod: ["Ohne Kochen"],
      diet: ["Vegan", "Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
        {
            title: "Nicht im Mixer!",
            content: "Authentische Guacamole wird immer mit einer Gabel zerdrückt, niemals im Mixer püriert. Die stückige Textur ist ein wesentliches Merkmal."
        }
    ]
  },
  {
    recipeTitle: "Klassisches Ungarisches Gulasch",
    shortDescription: "Ein herzhafter Schmortopf-Klassiker aus Ungarn. Zarte Rindfleischwürfel werden mit reichlich Zwiebeln und edelsüßem Paprika langsam gegart, bis das Fleisch zerfällt und eine tiefrote, sämige Sauce entsteht.",
    prepTime: "20 Min.",
    cookTime: "2 Std. 30 Min.",
    totalTime: "2 Std. 50 Min.",
    servings: "4-6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "kg", name: "Rindfleisch (Wade oder Schulter)" },
            { quantity: "750", unit: "g", name: "Zwiebeln" },
            { quantity: "3", unit: "EL", name: "Paprikapulver, edelsüß" },
            { quantity: "1", unit: "TL", name: "Paprikapulver, scharf" },
            { quantity: "1", unit: "EL", name: "Tomatenmark" },
            { quantity: "1", unit: "TL", name: "Kümmel, gemahlen" }
        ]
      }
    ],
    instructions: [
        "Das Rindfleisch in ca. 3 cm große Würfel schneiden. Die Zwiebeln fein würfeln.",
        "Schmalz oder Öl in einem großen Schmortopf erhitzen und die Zwiebeln darin langsam goldbraun dünsten, bis sie weich sind. Das kann 15-20 Minuten dauern.",
        "Den Topf vom Herd nehmen und das Paprikapulver einrühren (nicht verbrennen lassen!). Sofort mit einem Schuss Essig oder Wasser ablöschen.",
        "Das Fleisch zugeben, salzen und pfeffern. Tomatenmark und Kümmel einrühren.",
        "Mit so viel Wasser oder Brühe auffüllen, dass das Fleisch knapp bedeckt ist. Aufkochen und zugedeckt bei niedrigster Hitze 2,5 Stunden schmoren.",
        "Nach der Schmorzeit sollte das Fleisch zart sein und die Sauce sämig. Mit Salz und Pfeffer abschmecken. Dazu passen Nockerl (Spätzle) oder Salzkartoffeln."
    ],
    nutritionPerServing: { calories: "600 kcal", protein: "50 g", fat: "40 g", carbs: "10 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Ungarisch"],
      occasion: ["Winter", "Wochenende"],
      mainIngredient: ["Rind"],
      prepMethod: ["One-Pot"],
      diet: []
    },
    expertTips: [
        {
            title: "Die Zwiebeln sind entscheidend",
            content: "Die große Menge an Zwiebeln, die langsam weich geschmort werden, ist das Geheimnis für eine sämige, natürlich gebundene Gulasch-Sauce. Nehmen Sie sich dafür Zeit."
        }
    ]
  }
];