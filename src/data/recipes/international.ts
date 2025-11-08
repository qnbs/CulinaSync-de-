import { Recipe } from '../../types';

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
        "Die gewürfelten Zwiebeln im selben Topf anbraten. Knoblauch und Kreuzkümmel hinzufügen und kurz mitrösten.",
        "Das Fleisch zurück in den Topf geben, die Chilipaste und die gehackten Tomaten hinzufügen. Mit so viel Wasser oder Brühe auffüllen, dass das Fleisch knapp bedeckt ist.",
        "Aufkochen, dann die Hitze reduzieren und zugedeckt 2-3 Stunden schmoren, bis das Fleisch butterzart ist.",
        "Die abgetropften Kidneybohnen hinzufügen und weitere 15 Minuten köcheln lassen. Mit Salz abschmecken.",
        "Mit saurer Sahne, frischem Koriander und Tortilla-Chips servieren."
    ],
    nutritionPerServing: { calories: "550 kcal", protein: "45 g", fat: "25 g", carbs: "30 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Mexikanisch", "Tex-Mex"],
      occasion: ["Wochenende", "Party"],
      mainIngredient: ["Rind"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Die richtigen Chilis",
            content: "Die Wahl der getrockneten Chilis ist entscheidend für den Geschmack. Ancho-Chilis sorgen für eine milde, fruchtige Süße, während Guajillo-Chilis eine leichte Schärfe und rauchige Noten beisteuern. Experimentieren Sie mit verschiedenen Sorten!"
        },
        {
            title: "Bohnen sind optional",
            content: "In einem absolut traditionellen Texas-Chili sind oft keine Bohnen enthalten ('Chili con Carne' bedeutet 'Chili mit Fleisch'). Fühlen Sie sich frei, sie wegzulassen, wenn Sie eine reinere Fleischversion bevorzugen."
        }
    ]
  },
  {
    recipeTitle: "Griechischer Moussaka",
    shortDescription: "Ein cremiger Auflauf aus geschichteten Auberginen, Kartoffeln und einer würzigen Lammhackfleisch-Sauce, gekrönt von einer reichhaltigen Béchamelsauce und im Ofen goldbraun gebacken. Das ultimative griechische Wohlfühlessen.",
    prepTime: "45 Min.",
    cookTime: "1 Std. 15 Min.",
    totalTime: "2 Std.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Gemüse- & Fleischschicht",
        items: [
          { quantity: "2", unit: "Stk.", name: "große Auberginen" },
          { quantity: "500", unit: "g", name: "festkochende Kartoffeln" },
          { quantity: "500", unit: "g", name: "Lammhackfleisch" },
          { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
          { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
          { quantity: "400", unit: "g", name: "gehackte Tomaten" },
          { quantity: "100", unit: "ml", name: "Rotwein" },
          { quantity: "1", unit: "TL", name: "getrockneter Oregano" },
          { quantity: "0.5", unit: "TL", name: "Zimt" }
        ]
      },
      {
        sectionTitle: "Für die Béchamelsauce",
        items: [
          { quantity: "60", unit: "g", name: "Butter" },
          { quantity: "60", unit: "g", name: "Mehl" },
          { quantity: "750", unit: "ml", name: "Milch" },
          { quantity: "2", unit: "Stk.", name: "Eigelb" },
          { quantity: "50", unit: "g", name: "geriebener Parmesan oder Kefalotyri" },
          { quantity: "", unit: "", name: "frisch geriebene Muskatnuss" }
        ]
      }
    ],
    instructions: [
      "Auberginen in 1 cm dicke Scheiben schneiden, salzen und 30 Min. Wasser ziehen lassen. Kartoffeln schälen, in dünne Scheiben schneiden und in Salzwasser vorkochen. Auberginen trocken tupfen und in Olivenöl goldbraun anbraten.",
      "Zwiebel und Knoblauch fein hacken und in Olivenöl andünsten. Das Lammhackfleisch zugeben und krümelig anbraten.",
      "Mit Rotwein ablöschen. Tomaten, Oregano und Zimt zugeben. Mit Salz und Pfeffer würzen und 20 Min. köcheln lassen.",
      "Für die Béchamel Butter schmelzen, Mehl einrühren und anschwitzen. Nach und nach die Milch unter Rühren zugeben und aufkochen, bis die Sauce andickt. Vom Herd nehmen, Eigelbe und Käse unterrühren. Mit Salz, Pfeffer und Muskatnuss abschmecken.",
      "Den Backofen auf 180°C vorheizen. Eine Auflaufform mit den Kartoffelscheiben auslegen. Darauf abwechselnd Hackfleischsauce und Auberginenscheiben schichten. Mit Hackfleischsauce abschließen.",
      "Die Béchamelsauce gleichmäßig darüber verteilen und mit etwas extra Käse bestreuen.",
      "Im Ofen ca. 45-50 Minuten backen, bis die Oberfläche goldbraun ist. Vor dem Anschneiden 15 Minuten ruhen lassen."
    ],
    nutritionPerServing: { calories: "620 kcal", protein: "30 g", fat: "40 g", carbs: "35 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Griechisch"],
      occasion: ["Wochenende", "Für Gäste"],
      mainIngredient: ["Lamm", "Gemüse"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
      { title: "Auberginen vorbereiten", content: "Das Salzen der Auberginen ist wichtig. Es entzieht ihnen Bitterstoffe und Wasser, sodass sie beim Braten weniger Öl aufsaugen und der Moussaka nicht wässrig wird." }
    ]
  },
  {
    recipeTitle: "Chicken Tikka Masala",
    shortDescription: "Zarte, in Joghurt marinierte Hähnchenstücke, gegrillt und serviert in einer cremig-würzigen Tomatensauce. Ein weltweiter Favorit der indischen Küche, der milder ist als viele andere Currys und dennoch voller Geschmack steckt.",
    prepTime: "20 Min. (+ 2 Std. Marinierzeit)",
    cookTime: "30 Min.",
    totalTime: "50 Min. (+ Marinierzeit)",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Hähnchen-Marinade (Tikka)",
        items: [
          { quantity: "500", unit: "g", name: "Hähnchenbrustfilet, gewürfelt" },
          { quantity: "150", unit: "g", name: "griechischer Joghurt" },
          { quantity: "1", unit: "EL", name: "Ingwer-Knoblauch-Paste" },
          { quantity: "1", unit: "TL", name: "Garam Masala" },
          { quantity: "1", unit: "TL", name: "Kurkuma" }
        ]
      },
      {
        sectionTitle: "Für die Masala-Sauce",
        items: [
          { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
          { quantity: "1", unit: "EL", name: "Ingwer-Knoblauch-Paste" },
          { quantity: "400", unit: "g", name: "passierte Tomaten" },
          { quantity: "1", unit: "TL", name: "Garam Masala" },
          { quantity: "1", unit: "TL", name: "gemahlener Koriander" },
          { quantity: "150", unit: "ml", name: "Sahne" },
          { quantity: "", unit: "", name: "frischer Koriander zum Servieren" }
        ]
      }
    ],
    instructions: [
      "Alle Zutaten für die Marinade vermischen, das Hähnchen darin wenden und für mindestens 2 Stunden (besser über Nacht) im Kühlschrank marinieren.",
      "Das marinierte Hähnchen auf Spieße stecken und im vorgeheizten Ofen bei 220°C (Grillfunktion) ca. 15-20 Minuten grillen, bis es gar ist und leichte Röstspuren hat. Alternativ in einer heißen Pfanne anbraten.",
      "Für die Sauce die Zwiebel fein hacken und in Öl glasig dünsten. Ingwer-Knoblauch-Paste zugeben und kurz mitbraten.",
      "Garam Masala und gemahlenen Koriander hinzufügen und 1 Minute rösten, bis es duftet.",
      "Die passierten Tomaten dazugeben, mit Salz würzen und die Sauce 10 Minuten köcheln lassen.",
      "Die Sahne einrühren und die Sauce weitere 5 Minuten simmern lassen. Bei Bedarf mit etwas Zucker abschmecken.",
      "Die gegrillten Hähnchenstücke in die Sauce geben und alles zusammen kurz erwärmen.",
      "Mit frischem Koriander bestreuen und mit Basmatireis oder Naan-Brot servieren."
    ],
    nutritionPerServing: { calories: "510 kcal", protein: "40 g", fat: "30 g", carbs: "20 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Indisch"],
      occasion: ["Wochenende"],
      mainIngredient: ["Huhn"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
      { title: "Cremige Sauce", content: "Für eine besonders samtige Sauce können Sie eine Handvoll eingeweichte Cashewkerne mit den Tomaten pürieren, bevor Sie sie zur Sauce geben. Das sorgt für eine natürliche Bindung und einen reichhaltigen Geschmack." }
    ]
  },
  {
    recipeTitle: "Amerikanische BBQ Ribs (Fall-off-the-bone)",
    shortDescription: "Spareribs, die so zart sind, dass das Fleisch fast vom Knochen fällt. Das Geheimnis ist die 'low and slow' Garmethode im Ofen, kombiniert mit einem würzigen 'Dry Rub' und einer rauchig-süßen BBQ-Sauce zum Glasieren.",
    prepTime: "20 Min.",
    cookTime: "3 Std.",
    totalTime: "3 Std. 20 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für die Ribs & den Rub",
        items: [
          { quantity: "2", unit: "kg", name: "Spareribs (Baby Back Ribs)" },
          { quantity: "4", unit: "EL", name: "brauner Zucker" },
          { quantity: "2", unit: "EL", name: "Paprikapulver, edelsüß" },
          { quantity: "1", unit: "EL", name: "Rauchpaprika" },
          { quantity: "1", unit: "TL", name: "Knoblauchpulver" },
          { quantity: "1", unit: "TL", name: "Cayennepfeffer" },
          { quantity: "2", unit: "TL", name: "Salz" }
        ]
      },
      {
        sectionTitle: "Zum Glasieren",
        items: [
          { quantity: "250", unit: "ml", name: "Ihre Lieblings-BBQ-Sauce" }
        ]
      }
    ],
    instructions: [
      "Den Backofen auf 140°C vorheizen. Ein Backblech mit Alufolie auslegen.",
      "Die Silberhaut auf der Knochenseite der Ribs mit einem Messer anheben und mit Küchenpapier abziehen. Dieser Schritt ist wichtig für zarte Ribs.",
      "Alle Zutaten für den Rub vermischen und die Ribs von allen Seiten großzügig damit einreiben.",
      "Die Ribs fest in zwei Lagen Alufolie einwickeln und auf das Backblech legen.",
      "Im Ofen für 2,5 Stunden garen.",
      "Die Ribs vorsichtig aus der Folie nehmen (Achtung, heißer Dampf!). Den Ofen auf 200°C (Grillfunktion) hochheizen.",
      "Die Ribs mit der Hälfte der BBQ-Sauce bestreichen und für 10 Minuten unter den Grill legen, bis die Sauce karamellisiert.",
      "Vorgang mit der restlichen Sauce wiederholen und weitere 5-10 Minuten grillen. Die Sauce sollte Blasen werfen, aber nicht verbrennen.",
      "Vor dem Anschneiden kurz ruhen lassen. Passt perfekt zu Coleslaw und Maiskolben."
    ],
    nutritionPerServing: { calories: "750 kcal", protein: "50 g", fat: "55 g", carbs: "25 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Amerikanisch"],
      occasion: ["Grillen", "Sommer", "Party"],
      mainIngredient: ["Schwein"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
      { title: "Silberhaut entfernen", content: "Die Silberhaut ist eine zähe Membran auf der Knochenseite. Sie wird beim Garen nicht weich und verhindert, dass die Gewürze tief ins Fleisch eindringen. Ihre Entfernung ist der wichtigste Schritt für wirklich zarte Rippchen." }
    ]
  }
];
