import { Recipe } from '../../types';

export const italianRecipes: Recipe[] = [
  {
    seedId: "it-01",
    recipeTitle: "Lasagne al Forno (Klassisch)",
    shortDescription: "Der Inbegriff italienischer Hausmannskost. Schichten aus frischem Eiernudelteig, einem reichhaltigen Ragù alla Bolognese, cremiger Béchamelsauce und reichlich Parmesan, im Ofen goldbraun überbacken.",
    prepTime: "50 Min.",
    cookTime: "2 Std. 30 Min.",
    totalTime: "3 Std. 20 Min.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für das Ragù alla Bolognese",
        items: [
          { quantity: "300", unit: "g", name: "Rinderhackfleisch" },
          { quantity: "150", unit: "g", name: "Pancetta (italienischer Speck), gewürfelt" },
          { quantity: "1", unit: "Stk.", name: "Zwiebel" },
          { quantity: "1", unit: "Stk.", name: "Karotte" },
          { quantity: "1", unit: "Stange", name: "Staudensellerie" },
          { quantity: "2", unit: "EL", name: "Olivenöl" },
          { quantity: "100", unit: "ml", name: "trockener Rotwein" },
          { quantity: "400", unit: "g", name: "gehackte Tomaten (Dose)" },
          { quantity: "150", unit: "ml", name: "Milch" },
          { quantity: "", unit: "", name: "Salz, Pfeffer, Muskatnuss" }
        ]
      },
      {
        sectionTitle: "Für die Béchamelsauce",
        items: [
          { quantity: "50", unit: "g", name: "Butter" },
          { quantity: "50", unit: "g", name: "Mehl" },
          { quantity: "750", unit: "ml", name: "Milch" },
          { quantity: "", unit: "", name: "Salz, Pfeffer, Muskatnuss" }
        ]
      },
      {
        sectionTitle: "Außerdem",
        items: [
          { quantity: "12", unit: "Blätter", name: "Lasagneplatten (ohne Vorkochen)" },
          { quantity: "150", unit: "g", name: "Parmesan, frisch gerieben" }
        ]
      }
    ],
    instructions: [
      "Für das Ragù Zwiebel, Karotte und Sellerie sehr fein würfeln. Olivenöl in einem Topf erhitzen, Pancetta auslassen. Das Gemüse zugeben und bei niedriger Hitze 10 Minuten dünsten.",
      "Hitze erhöhen, Hackfleisch zugeben und krümelig anbraten. Mit Rotwein ablöschen und einkochen lassen.",
      "Tomaten und Milch zugeben, mit Salz, Pfeffer und Muskatnuss würzen. Aufkochen und dann bei niedrigster Hitze zugedeckt mindestens 2 Stunden schmoren lassen.",
      "Für die Béchamel die Butter in einem Topf schmelzen. Mehl einrühren und kurz anschwitzen. Nach und nach die Milch mit einem Schneebesen einrühren, um Klümpchen zu vermeiden. Unter Rühren aufkochen und 5 Minuten köcheln lassen. Mit Salz, Pfeffer und Muskatnuss würzen.",
      "Den Backofen auf 180°C Ober-/Unterhitze vorheizen. Eine Auflaufform (ca. 20x30 cm) mit Butter ausstreichen.",
      "Eine dünne Schicht Béchamel auf dem Boden der Form verteilen. Darauf eine Schicht Lasagneplatten legen.",
      "Abwechselnd Ragù, Béchamel, eine Prise Parmesan und Lasagneplatten schichten. Mit einer Schicht Ragù und Béchamel abschließen.",
      "Die Lasagne mit dem restlichen Parmesan bestreuen und im Ofen ca. 30-40 Minuten goldbraun backen. Vor dem Anschneiden 10 Minuten ruhen lassen."
    ],
    nutritionPerServing: { calories: "612 kcal", protein: "34 g", fat: "31 g", carbs: "44 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Italienisch"],
      occasion: ["Wochenende", "Für Gäste"],
      mainIngredient: ["Hackfleisch", "Pasta"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        { title: "Ragù ist der Schlüssel", content: "Ein gutes Ragù braucht Zeit. Je länger es bei niedriger Temperatur schmort, desto intensiver und komplexer wird der Geschmack." }
    ]
  },
  {
    seedId: "it-02",
    recipeTitle: "Spaghetti Carbonara (Originalrezept)",
    shortDescription: "Ein ikonisches Pastagericht aus Rom. Das Originalrezept besticht durch seine cremige Sauce aus Eigelb, Pecorino Romano und dem ausgelassenen Fett von Guanciale (luftgetrockneter Schweinebacke).",
    prepTime: "10 Min.",
    cookTime: "15 Min.",
    totalTime: "25 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "400", unit: "g", name: "Spaghetti" },
            { quantity: "150", unit: "g", name: "Guanciale (oder Pancetta)" },
            { quantity: "4", unit: "Stk.", name: "frische Eigelb" },
            { quantity: "100", unit: "g", name: "Pecorino Romano, gerieben" },
            { quantity: "", unit: "", name: "schwarzer Pfeffer, frisch gemahlen" }
        ]
      }
    ],
    instructions: [
        "Reichlich Wasser für die Spaghetti zum Kochen bringen und salzen.",
        "Den Guanciale in kleine Würfel oder Streifen schneiden. In einer großen, kalten Pfanne bei mittlerer Hitze langsam knusprig auslassen. Das Fett schmilzt dabei aus. Die knusprigen Stücke aus der Pfanne nehmen, das Fett in der Pfanne lassen.",
        "In einer Schüssel die Eigelbe mit dem geriebenen Pecorino und einer sehr großzügigen Menge frisch gemahlenem schwarzen Pfeffer verquirlen, bis eine dicke Paste entsteht.",
        "Die Spaghetti al dente kochen. Kurz bevor sie fertig sind, eine kleine Tasse des stärkehaltigen Nudelwassers abschöpfen.",
        "Ein bis zwei Esslöffel des heißen Nudelwassers zur Eier-Käse-Paste geben und schnell verrühren, um die Eier zu temperieren und die Sauce geschmeidiger zu machen.",
        "Die Spaghetti abgießen und sofort in die heiße Pfanne mit dem Guanciale-Fett geben. Gut durchschwenken.",
        "Die Pfanne vom Herd nehmen! Die Eier-Käse-Mischung über die heißen Nudeln gießen und alles sehr schnell vermengen. Die Resthitze der Nudeln und der Pfanne gart die Eier sanft und erzeugt eine cremige Sauce, ohne zu Rührei zu werden. Bei Bedarf noch etwas Nudelwasser hinzufügen, um die gewünschte Konsistenz zu erreichen.",
        "Die knusprigen Guanciale-Stücke untermischen und sofort servieren. Mit extra Pecorino und Pfeffer bestreuen."
    ],
    nutritionPerServing: { calories: "750 kcal", protein: "30 g", fat: "45 g", carbs: "55 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Italienisch"],
      occasion: ["Alltagsküche", "Schnelle Küche"],
      mainIngredient: ["Pasta", "Schwein"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Keine Sahne, kein Rührei!",
            content: "Das Geheimnis der Cremigkeit liegt in der Emulsion aus Eigelb, Pecorino, Nudelwasser und Guanciale-Fett. Die Pfanne muss unbedingt vom Herd genommen werden, bevor die Eiermischung hinzugefügt wird, um Rührei zu vermeiden."
        }
    ]
  },
  {
    seedId: "it-03",
    recipeTitle: "Risotto alla Milanese",
    shortDescription: "Ein cremiger und leuchtend gelber Risotto-Klassiker aus Mailand. Der unverwechselbare Geschmack und die Farbe stammen von Safranfäden. Oft als Beilage zu Osso Buco serviert.",
    prepTime: "10 Min.",
    cookTime: "30 Min.",
    totalTime: "40 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "320", unit: "g", name: "Risottoreis (z.B. Arborio)" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Briefchen", name: "Safranfäden" },
            { quantity: "1.2", unit: "l", name: "heiße Rinderbrühe" },
            { quantity: "100", unit: "ml", name: "Weißwein" },
            { quantity: "80", unit: "g", name: "Butter" },
            { quantity: "80", unit: "g", name: "Parmesan, gerieben" }
        ]
      }
    ],
    instructions: [
        "Die Rinderbrühe in einem separaten Topf erhitzen und warm halten. Die Safranfäden in einer kleinen Tasse mit etwas heißer Brühe auflösen.",
        "Die Zwiebel sehr fein würfeln. Die Hälfte der Butter in einem großen, schweren Topf schmelzen und die Zwiebel darin glasig dünsten.",
        "Den Reis hinzufügen und unter ständigem Rühren 2-3 Minuten mitdünsten, bis die Körner glasig sind ('tostatura').",
        "Mit dem Weißwein ablöschen und vollständig einkochen lassen, dabei weiter rühren.",
        "Eine Kelle der heißen Brühe hinzufügen und unter Rühren einkochen lassen. Diesen Vorgang wiederholen, immer eine Kelle Brühe nach der anderen hinzufügen, sobald die Flüssigkeit vom Reis aufgesogen wurde. Ständiges Rühren ist wichtig, um die Stärke aus dem Reis zu lösen und das Risotto cremig zu machen.",
        "Nach ca. 15 Minuten Kochzeit die Safran-Brühe-Mischung hinzufügen und gut unterrühren.",
        "Weiter Brühe hinzufügen und rühren, bis der Reis nach ca. 18-20 Minuten gar, aber noch bissfest ('al dente') ist.",
        "Den Topf vom Herd nehmen. Die restliche kalte Butter und den geriebenen Parmesan energisch unterrühren ('mantecatura'). Dadurch wird das Risotto besonders cremig.",
        "Das Risotto mit Salz und Pfeffer abschmecken, eine Minute ruhen lassen und sofort servieren."
    ],
    nutritionPerServing: { calories: "562 kcal", protein: "13 g", fat: "26 g", carbs: "66 g" },
    tags: {
      course: ["Hauptgericht", "Beilage"],
      cuisine: ["Italienisch"],
      mainIngredient: ["Reis"],
      prepMethod: ["Pfannengericht"],
      occasion: [],
      diet: ["Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
        {
            title: "Die 'Mantecatura'",
            content: "Das energische Einrühren von kalter Butter und Parmesan am Ende (Mantecatura) ist der wichtigste Schritt für ein perfekt cremiges Risotto. Dies muss abseits der Hitze geschehen, um eine seidige Emulsion zu erzeugen."
        }
    ]
  },
  {
    seedId: "it-04",
    recipeTitle: "Osso Buco alla Milanese",
    shortDescription: "Ein Schmorgericht-Klassiker aus der Lombardei. Dicke Kalbsbeinscheiben werden langsam in einer aromatischen Soße aus Weißwein, Tomaten und Gemüse gegart, bis das Fleisch butterzart ist.",
    prepTime: "20 Min.",
    cookTime: "2 Std.",
    totalTime: "2 Std. 20 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "4", unit: "Stk.", name: "Kalbsbeinscheiben (je ca. 4cm dick)" },
            { quantity: "50", unit: "g", name: "Mehl" },
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Stk.", name: "Karotte" },
            { quantity: "1", unit: "Stange", name: "Staudensellerie" },
            { quantity: "150", unit: "ml", name: "Weißwein" },
            { quantity: "400", unit: "g", name: "gehackte Tomaten" },
            { quantity: "500", unit: "ml", name: "Brühe" }
        ]
      },
      {
        sectionTitle: "Für die Gremolata",
        items: [
            { quantity: "1", unit: "Bund", name: "glatte Petersilie" },
            { quantity: "1", unit: "Stk.", name: "Bio-Zitrone (Abrieb)" },
            { quantity: "1", unit: "Stk.", name: "Knoblauchzehe" }
        ]
      }
    ],
    instructions: [
        "Den Rand der Kalbsbeinscheiben an mehreren Stellen einschneiden, damit sie sich beim Braten nicht wölben. Mit Salz und Pfeffer würzen und leicht in Mehl wenden.",
        "Die Butter in einem großen Schmortopf erhitzen und die Beinscheiben von beiden Seiten goldbraun anbraten. Aus dem Topf nehmen.",
        "Zwiebel, Karotte und Sellerie fein würfeln und im selben Topf bei mittlerer Hitze andünsten.",
        "Die Beinscheiben zurück in den Topf legen. Mit Weißwein ablöschen und einkochen lassen.",
        "Tomaten und Brühe hinzufügen, sodass die Beinscheiben knapp bedeckt sind. Aufkochen lassen, dann die Hitze reduzieren.",
        "Zugedeckt bei schwacher Hitze ca. 1,5 bis 2 Stunden schmoren, bis das Fleisch so zart ist, dass es fast vom Knochen fällt.",
        "Für die Gremolata die Petersilie und den Knoblauch sehr fein hacken. Mit dem Zitronenabrieb mischen.",
        "Das Osso Buco auf Tellern anrichten, mit etwas von der Soße übergießen und kurz vor dem Servieren mit der Gremolata bestreuen. Klassisch wird dazu Risotto alla Milanese serviert."
    ],
    nutritionPerServing: { calories: "549 kcal", protein: "50 g", fat: "30 g", carbs: "15 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Italienisch"],
      mainIngredient: ["Kalb"],
      prepMethod: ["Ofengericht"],
      occasion: ["Festessen", "Wochenende"],
      diet: []
    },
    expertTips: [
        {
            title: "Die Gremolata nicht vergessen",
            content: "Die Gremolata ist kein optionales Extra, sondern ein wesentlicher Bestandteil des Gerichts. Ihre frischen, zitronigen und knoblauchartigen Noten durchschneiden die Reichhaltigkeit des Schmorgerichts und sorgen für eine perfekte Geschmacksbalance."
        }
    ]
  },
  {
    seedId: "it-05",
    recipeTitle: "Saltimbocca alla Romana",
    shortDescription: "Ein blitzschneller Klassiker aus Rom, dessen Name wörtlich 'springt in den Mund' bedeutet. Dünne Kalbsschnitzel werden mit Prosciutto und Salbei belegt und in Butter und Weißwein kurz gebraten.",
    prepTime: "15 Min.",
    cookTime: "10 Min.",
    totalTime: "25 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "4", unit: "Stk.", name: "dünne Kalbsschnitzel (à ca. 80g)" },
            { quantity: "4", unit: "Scheiben", name: "Parmaschinken" },
            { quantity: "8", unit: "Blätter", name: "frischer Salbei" },
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "100", unit: "ml", name: "trockener Weißwein" },
            { quantity: "", unit: "", name: "Salz, Pfeffer" },
            { quantity: "1", unit: "EL", name: "Mehl (optional)" }
        ]
      }
    ],
    instructions: [
        "Die Kalbsschnitzel zwischen Frischhaltefolie legen und sehr dünn klopfen.",
        "Auf jedes Schnitzel eine Scheibe Parmaschinken und darauf zwei Salbeiblätter legen. Mit einem Zahnstocher fixieren.",
        "Die Schnitzel nur auf der Fleischseite (nicht auf der Schinkenseite) ganz leicht salzen und pfeffern und dünn mit Mehl bestäuben.",
        "Die Hälfte der Butter in einer großen Pfanne bei mittlerer bis hoher Hitze aufschäumen lassen.",
        "Die Saltimbocca mit der Schinkenseite nach unten in die Pfanne legen und ca. 2 Minuten scharf anbraten, bis der Schinken knusprig ist.",
        "Wenden und die Fleischseite ebenfalls ca. 1-2 Minuten braten, bis sie gar ist. Das Fleisch sollte zart bleiben.",
        "Die Saltimbocca aus der Pfanne nehmen und warm stellen.",
        "Den Bratensatz in der Pfanne mit dem Weißwein ablöschen und kurz aufkochen lassen. Die restliche Butter einrühren, um die Soße zu binden. Mit Salz und Pfeffer abschmecken.",
        "Die Saltimbocca mit der Soße beträufelt servieren. Dazu passt Ciabatta oder ein leichter Salat."
    ],
    nutritionPerServing: { calories: "299 kcal", protein: "20 g", fat: "18 g", carbs: "10 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Italienisch"],
      occasion: ["Alltagsküche", "Schnelle Küche"],
      mainIngredient: ["Kalb"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Nicht überkochen",
            content: "Kalbsschnitzel ist sehr mager und wird bei zu langem Braten schnell trocken und zäh. Das Braten sollte wirklich nur wenige Minuten dauern."
        }
    ]
  },
  {
    seedId: "it-06",
    recipeTitle: "Vitello Tonnato",
    shortDescription: "Eine klassische italienische Vorspeise aus dem Piemont. Dünn aufgeschnittenes, zart gekochtes Kalbfleisch wird mit einer cremigen Thunfisch-Kapern-Sauce serviert. Ein perfektes Gericht für Buffets oder als elegante Vorspeise an warmen Tagen.",
    prepTime: "35 Min. (+ Kühlzeit)",
    cookTime: "90 Min.",
    totalTime: "2 Std. 5 Min. (+ mind. 2 Std. Kühlzeit)",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für das Kalbfleisch",
        items: [
            { quantity: "800", unit: "g", name: "Kalbfleisch (Nuss oder Oberschale)" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Stk.", name: "Karotte" },
            { quantity: "1", unit: "Stange", name: "Sellerie" }
        ]
      },
      {
        sectionTitle: "Für die Tonnato-Sauce",
        items: [
            { quantity: "200", unit: "g", name: "Thunfisch in Öl, abgetropft" },
            { quantity: "4", unit: "Stk.", name: "Sardellenfilets" },
            { quantity: "3", unit: "EL", name: "Kapern" },
            { quantity: "2", unit: "Stk.", name: "frische Eigelb" },
            { quantity: "200", unit: "ml", name: "Olivenöl" },
            { quantity: "1", unit: "Schuss", name: "Zitronensaft" }
        ]
      },
      {
        sectionTitle: "Zum Garnieren",
        items: [
          { quantity: "2", unit: "EL", name: "Kapernäpfel oder große Kapern" }
        ]
      }
    ],
    instructions: [
        "Das Gemüse für das Kalbfleisch grob würfeln. Das Fleisch mit dem Gemüse in einen Topf geben, mit Wasser bedecken, salzen und aufkochen. Dann bei schwacher Hitze ca. 90 Minuten simmern lassen, bis das Fleisch gar ist.",
        "Das Fleisch in der Brühe vollständig auskühlen lassen (am besten über Nacht im Kühlschrank).",
        "Für die Sauce Thunfisch, Sardellenfilets, 2 EL Kapern und Eigelb in einen hohen Rührbecher geben. Mit einem Stabmixer pürieren.",
        "Während des Pürierens langsam das Olivenöl einlaufen lassen, bis eine cremige, mayonnaisenähnliche Sauce entsteht.",
        "Die Sauce mit Zitronensaft, Salz und Pfeffer abschmecken. Wenn sie zu dick ist, etwas von der abgekühlten Kalbsbrühe unterrühren.",
        "Das kalte Kalbfleisch aus der Brühe nehmen, trocken tupfen und mit einer Aufschnittmaschine oder einem sehr scharfen Messer in hauchdünne Scheiben schneiden.",
        "Die Fleischscheiben fächerförmig auf einer großen Platte anrichten.",
        "Die Tonnato-Sauce großzügig über dem Fleisch verteilen.",
        "Mit den restlichen Kapern oder Kapernäpfeln garnieren und mindestens 1 Stunde im Kühlschrank durchziehen lassen vor dem Servieren."
    ],
    nutritionPerServing: { calories: "381 kcal", protein: "28 g", fat: "28 g", carbs: "5 g" },
    tags: {
      course: ["Vorspeise"],
      cuisine: ["Italienisch"],
      occasion: ["Für Gäste", "Sommer", "Party"],
      mainIngredient: ["Kalb", "Fisch"],
      prepMethod: ["Ohne Kochen"],
      diet: []
    },
    expertTips: [
        {
            title: "Fleisch im Sud abkühlen lassen",
            content: "Das Garen und anschließende Abkühlen des Kalbfleischs direkt im Kochsud ist entscheidend. Dadurch bleibt das Fleisch unglaublich saftig und zart."
        }
    ]
  },
  {
    seedId: "it-07",
    recipeTitle: "Pollo alla Cacciatora (Huhn nach Jägerart)",
    shortDescription: "Ein rustikales und aromatisches Schmorgericht aus Italien. Hähnchenteile werden knusprig angebraten und dann langsam in einer würzigen Tomatensoße mit Kräutern, Oliven und Kapern gegart. Ein einfaches Gericht, das voller Geschmack steckt.",
    prepTime: "20 Min.",
    cookTime: "60 Min.",
    totalTime: "1 Std. 20 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "Stk.", name: "Hähnchen, zerlegt in 8 Teile" },
            { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "400", unit: "g", name: "gehackte Tomaten" },
            { quantity: "100", unit: "g", name: "schwarze Oliven" },
            { quantity: "2", unit: "EL", name: "Kapern" },
            { quantity: "150", unit: "ml", name: "Weißwein" },
            { quantity: "1", unit: "Zweig", name: "Rosmarin" },
            { quantity: "", unit: "", name: "Salz, Pfeffer, Olivenöl" }
        ]
      }
    ],
    instructions: [
        "Die Hähnchenteile mit Salz und Pfeffer würzen.",
        "Olivenöl in einem großen Schmortopf erhitzen. Die Hähnchenteile darin von allen Seiten goldbraun anbraten. Aus dem Topf nehmen und beiseitelegen.",
        "Die Zwiebel und den Knoblauch fein hacken und im selben Topf glasig dünsten.",
        "Mit Weißwein ablöschen und den Bratensatz vom Boden lösen. Kurz einkochen lassen.",
        "Die gehackten Tomaten, Oliven, Kapern und den Rosmarinzweig hinzufügen. Mit Salz und Pfeffer würzen.",
        "Die Hähnchenteile zurück in den Topf legen, sodass sie von der Soße bedeckt sind.",
        "Zugedeckt bei schwacher Hitze ca. 60 Minuten schmoren lassen, bis das Hähnchen gar und zart ist.",
        "Vor dem Servieren den Rosmarinzweig entfernen und die Soße nochmals abschmecken. Dazu passt Polenta oder Ciabatta."
    ],
    nutritionPerServing: { calories: "550 kcal", protein: "45 g", fat: "35 g", carbs: "10 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Italienisch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Huhn"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Variationen",
            content: "Das 'Jägerart'-Rezept ist sehr variabel. Fügen Sie je nach Saison und Vorliebe auch Pilze, Paprika oder Sellerie hinzu, um dem Gericht eine persönliche Note zu geben."
        }
    ]
  },
  {
    seedId: "it-08",
    recipeTitle: "Melanzane alla Parmigiana (Auberginenauflauf)",
    shortDescription: "Ein vegetarischer Klassiker aus Süditalien. Gebratene Auberginenscheiben werden mit einer fruchtigen Tomatensoße, Basilikum, Mozzarella und reichlich Parmesan geschichtet und im Ofen goldbraun überbacken. Ein sättigendes und unglaublich geschmackvolles Hauptgericht.",
    prepTime: "30 Min.",
    cookTime: "35 Min.",
    totalTime: "1 Std. 5 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "2", unit: "Stk.", name: "große Auberginen" },
            { quantity: "800", unit: "g", name: "gehackte Tomaten aus der Dose" },
            { quantity: "2", unit: "Kugeln", name: "Mozzarella (à 125g)" },
            { quantity: "100", unit: "g", name: "Parmesan, frisch gerieben" },
            { quantity: "1", unit: "Bund", name: "Basilikum" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "", unit: "", name: "Olivenöl, Salz, Pfeffer" }
        ]
      }
    ],
    instructions: [
        "Die Auberginen waschen und in ca. 1 cm dicke Scheiben schneiden. Die Scheiben salzen und 30 Minuten Wasser ziehen lassen. Anschließend trocken tupfen.",
        "Reichlich Olivenöl in einer großen Pfanne erhitzen und die Auberginenscheiben portionsweise von beiden Seiten goldbraun anbraten. Auf Küchenpapier abtropfen lassen.",
        "Für die Tomatensoße Zwiebel und Knoblauch fein hacken. In etwas Olivenöl andünsten, die gehackten Tomaten zugeben und ca. 15 Minuten köcheln lassen. Mit Salz, Pfeffer und der Hälfte des gehackten Basilikums würzen.",
        "Den Backofen auf 200°C Ober-/Unterhitze vorheizen. Den Mozzarella in Scheiben schneiden.",
        "Eine Auflaufform mit etwas Tomatensoße ausstreichen. Dann abwechselnd Auberginenscheiben, Tomatensoße, Mozzarella, Parmesan und Basilikumblätter schichten. Mit einer Schicht Tomatensoße und reichlich Parmesan abschließen.",
        "Im vorgeheizten Ofen ca. 20-25 Minuten backen, bis der Käse geschmolzen und goldbraun ist.",
        "Vor dem Servieren 10 Minuten ruhen lassen."
    ],
    nutritionPerServing: { calories: "600 kcal", protein: "25 g", fat: "45 g", carbs: "20 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Italienisch"],
      occasion: ["Für Gäste", "Wochenende"],
      mainIngredient: ["Gemüse", "Käse"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Auberginen entbittern",
            content: "Das Einsalzen der Auberginen entzieht ihnen nicht nur Bitterstoffe, sondern auch Wasser. Dadurch saugen sie beim Braten weniger Öl auf und das Gericht wird weniger fettig."
        }
    ]
  }
];