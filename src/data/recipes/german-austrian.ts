import { Recipe } from '@/types';

export const germanAustrianRecipes: Recipe[] = [
  {
    recipeTitle: "Bayerischer Schweinebraten mit Kruste und Knödeln",
    shortDescription: "Ein bayerischer Wirtshausklassiker, der zu Hause gelingt. Saftiges Fleisch, eine unwiderstehlich knusprige Kruste und eine kräftige Biersoße machen diesen Braten zum perfekten Sonntagsessen.",
    prepTime: "30 Min.",
    cookTime: "3 Std. 10 Min.",
    totalTime: "3 Std. 40 Min.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
          { quantity: "2", unit: "kg", name: "Schweinebauch oder -schulter mit Schwarte" },
          { quantity: "2", unit: "Stk.", name: "Zwiebeln" },
          { quantity: "2", unit: "Stk.", name: "Karotten" },
          { quantity: "0.5", unit: "Stk.", name: "Sellerieknolle" },
          { quantity: "1", unit: "Stange", name: "Lauch" },
          { quantity: "4", unit: "Stk.", name: "Knoblauchzehen" },
          { quantity: "1", unit: "TL", name: "Kümmel, ganz" },
          { quantity: "1", unit: "TL", name: "Paprikapulver, edelsüß" },
          { quantity: "", unit: "", name: "Salz, frisch gemahlener Pfeffer" },
          { quantity: "1", unit: "l", name: "Dunkelbier" },
          { quantity: "500", unit: "ml", name: "Fleisch- oder Gemüsebrühe" },
          { quantity: "1", unit: "EL", name: "Tomatenmark" }
        ]
      }
    ],
    instructions: [
      "Den Backofen auf 130°C Ober-/Unterhitze vorheizen. Das Gemüse waschen und grob würfeln. Knoblauchzehen andrücken. Gemüse in einen Bräter geben.",
      "Die Schwarte des Schweinebratens mit einem scharfen Messer rautenförmig einschneiden. Darauf achten, nicht ins Fleisch zu schneiden. Die Schwarte kräftig mit Salz einreiben.",
      "Die Fleischseite mit gepresstem Knoblauch, Paprikapulver, Kümmel und Pfeffer einreiben.",
      "Den Braten mit der Schwarte nach oben auf das Gemüse in den Bräter legen. Etwa die Hälfte des Biers und die Brühe angießen.",
      "Den Braten für ca. 3 Stunden im Ofen garen. Jede Stunde mit etwas von dem restlichen Bier und dem Bratensaft aus dem Bräter übergießen.",
      "Nach der Garzeit den Braten aus dem Bräter nehmen und warm stellen. Den Backofen auf 230°C Oberhitze/Grillfunktion stellen.",
      "Den Bratensaft durch ein Sieb in einen Topf passieren, das Gemüse dabei gut ausdrücken. Die Soße aufkochen, bei Bedarf etwas einkochen lassen und mit Salz und Pfeffer abschmecken.",
      "Den Braten zurück in den Bräter (ohne Soße) oder auf ein Gitter legen und für ca. 10 Minuten unter dem Grill knusprig aufpoppen lassen, bis die Kruste perfekt ist.",
      "Den fertigen Braten in Scheiben schneiden und mit der Soße, Semmelknödeln und Krautsalat servieren."
    ],
    nutritionPerServing: { calories: "850 kcal", protein: "60 g", fat: "65 g", carbs: "10 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch", "Deutsch-Bayerisch"],
      occasion: ["Wochenende", "Feiertage"],
      mainIngredient: ["Schwein"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
      {
        title: "Für eine garantiert knusprige Kruste",
        content: "Die Schwarte des Bratens 30 Minuten vor Ende der Garzeit nicht mehr übergießen. Am Ende die Temperatur stark erhöhen und nur noch Oberhitze oder die Grillfunktion verwenden."
      },
      {
        title: "Soße verfeinern",
        content: "Für eine intensivere Soße das Röstgemüse kräftig anbraten, bevor der Braten daraufgelegt wird. Ein Löffel Senf oder Tomatenmark, mit dem Gemüse angeröstet, verleiht zusätzliche Tiefe."
      }
    ]
  },
  {
    recipeTitle: "Klassische Rinderrouladen",
    shortDescription: "Ein deutsches Traditionsgericht wie von Oma. Zarte Rouladen aus der Rinderoberschale, gefüllt mit Speck, Zwiebeln und Gewürzgurken, langsam in einer kräftigen Rotweinsoße geschmort.",
    prepTime: "30 Min.",
    cookTime: "90 Min.",
    totalTime: "2 Std.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
          { quantity: "4", unit: "Stk.", name: "Rinderrouladen (à ca. 180g, aus der Oberschale)" },
          { quantity: "4", unit: "EL", name: "mittelscharfer Senf" },
          { quantity: "", unit: "", name: "Salz, frisch gemahlener Pfeffer" },
          { quantity: "8", unit: "Scheiben", name: "durchwachsener Speck" },
          { quantity: "2", unit: "Stk.", name: "große Zwiebeln" },
          { quantity: "4", unit: "Stk.", name: "Gewürzgurken" },
          { quantity: "2", unit: "EL", name: "Butterschmalz oder Pflanzenöl" },
          { quantity: "1", unit: "Bund", name: "Suppengrün (Karotte, Sellerie, Lauch)" },
          { quantity: "1", unit: "EL", name: "Tomatenmark" },
          { quantity: "250", unit: "ml", name: "trockener Rotwein" },
          { quantity: "500", unit: "ml", name: "Rinderfond" },
          { quantity: "2", unit: "Stk.", name: "Lorbeerblätter" },
          { quantity: "1", unit: "TL", name: "Speisestärke (optional)" }
        ]
      }
    ],
    instructions: [
      "Die Rouladen zwischen Frischhaltefolie legen und vorsichtig flach klopfen. Eine Zwiebel und die Gewürzgurken in feine Streifen schneiden. Das Suppengrün putzen und würfeln. Die zweite Zwiebel ebenfalls würfeln.",
      "Die Rouladen auf der Arbeitsfläche ausbreiten, mit Senf bestreichen und kräftig mit Salz und Pfeffer würzen.",
      "Jede Roulade mit 2 Scheiben Speck, Zwiebelstreifen und Gurkenstreifen belegen. Die Längsseiten leicht einschlagen, dann von der kurzen Seite her fest aufrollen und mit Küchengarn oder Rouladennadeln fixieren.",
      "Butterschmalz in einem Schmortopf erhitzen und die Rouladen von allen Seiten scharf anbraten. Herausnehmen und beiseitelegen.",
      "Im selben Topf das gewürfelte Suppengrün und die Zwiebelwürfel anrösten. Tomatenmark zugeben und kurz mitrösten.",
      "Mit dem Rotwein ablöschen und den Bratensatz vom Topfboden lösen. Die Flüssigkeit fast vollständig einkochen lassen.",
      "Den Rinderfond angießen, Lorbeerblätter hinzufügen und die Rouladen zurück in den Topf legen. Zugedeckt bei schwacher Hitze für 90 Minuten schmoren lassen, bis das Fleisch zart ist.",
      "Die fertigen Rouladen aus der Soße nehmen und warm stellen. Das Küchengarn entfernen.",
      "Die Soße durch ein feines Sieb passieren, dabei das Gemüse gut ausdrücken. Nochmals aufkochen und mit Salz und Pfeffer abschmecken. Bei Bedarf mit etwas in kaltem Wasser angerührter Speisestärke binden.",
      "Rouladen in der Soße servieren. Dazu passen klassisch Kartoffelklöße und Apfelrotkohl."
    ],
    nutritionPerServing: { calories: "830 kcal", protein: "75 g", fat: "50 g", carbs: "12 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch"],
      occasion: ["Wochenende", "Feiertage"],
      mainIngredient: ["Rind"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
      {
        title: "Fleischwahl",
        content: "Für besonders zarte Rouladen sollte Fleisch aus der Oberschale verwendet werden. Es ist mager und kurzfaserig."
      }
    ]
  },
  {
    recipeTitle: "Wiener Schnitzel (Original vom Kalb)",
    shortDescription: "Der unangefochtene Klassiker der österreichischen und deutschen Küche. Hauchdünn geklopftes Kalbfleisch, umhüllt von einer luftigen, goldbraunen Panade, die beim Braten Wellen wirft ('souffliert').",
    prepTime: "20 Min.",
    cookTime: "10 Min.",
    totalTime: "30 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
          { quantity: "4", unit: "Stk.", name: "Kalbsschnitzel (à ca. 150g, aus der Oberschale)" },
          { quantity: "100", unit: "g", name: "Mehl (Type 405, griffig)" },
          { quantity: "2", unit: "Stk.", name: "Eier (Gr. M)" },
          { quantity: "2", unit: "EL", name: "Schlagsahne" },
          { quantity: "150", unit: "g", name: "Semmelbrösel (vom Bäcker, nicht zu fein)" },
          { quantity: "", unit: "", name: "Salz" },
          { quantity: "300", unit: "g", name: "Butterschmalz" },
          { quantity: "1", unit: "Stk.", name: "Bio-Zitrone (zum Servieren)" }
        ]
      }
    ],
    instructions: [
      "Die Kalbsschnitzel zwischen zwei Lagen Frischhaltefolie legen und mit einem Fleischklopfer vorsichtig auf eine Dicke von ca. 4-5 mm klopfen.",
      "Eine Panierstraße vorbereiten: einen tiefen Teller mit Mehl, einen mit den verquirlten Eiern und der Sahne, und einen mit den Semmelbröseln.",
      "Die Schnitzel von beiden Seiten salzen.",
      "Die Schnitzel nacheinander zuerst im Mehl wenden (überschüssiges Mehl abklopfen), dann durch die Ei-Sahne-Mischung ziehen und zum Schluss in den Semmelbröseln wenden. Die Panade nicht andrücken, damit sie luftig bleibt.",
      "In einer großen, schweren Pfanne reichlich Butterschmalz erhitzen (ca. 170°C). Die Schnitzel müssen darin schwimmen können.",
      "Die panierten Schnitzel sofort ins heiße Fett geben und von jeder Seite ca. 2-3 Minuten goldbraun backen. Dabei die Pfanne leicht schwenken, sodass das heiße Fett auch über die Oberseite des Schnitzels schwappt.",
      "Die fertigen Schnitzel aus der Pfanne heben und auf Küchenpapier kurz abtropfen lassen.",
      "Sofort mit Zitronenspalten servieren. Traditionelle Beilage ist ein lauwarmer Kartoffel-Vogerlsalat (Feldsalat)."
    ],
    nutritionPerServing: { calories: "510 kcal", protein: "35 g", fat: "18 g", carbs: "49 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch", "Österreichisch"],
      occasion: ["Wochenende", "Für Gäste"],
      mainIngredient: ["Kalb"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
      {
        title: "Die perfekte Panade",
        content: "Der Schlüssel zum Soufflieren ist, die Panade nicht anzudrücken und das Schnitzel in reichlich heißem Butterschmalz schwimmend auszubacken, während die Pfanne geschwenkt wird."
      }
    ]
  },
  {
    recipeTitle: "Allgäuer Käsespätzle (Originalrezept)",
    shortDescription: "Das ultimative süddeutsche Wohlfühlessen. Frisch geschabte Eiernudeln (Spätzle) werden abwechselnd mit kräftigem Bergkäse geschichtet und mit knusprigen Röstzwiebeln gekrönt.",
    prepTime: "20 Min.",
    cookTime: "20 Min.",
    totalTime: "40 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für den Spätzleteig",
        items: [
          { quantity: "400", unit: "g", name: "Weizenmehl (Type 405 oder Spätzlemehl)" },
          { quantity: "4", unit: "Stk.", name: "Eier (Gr. M)" },
          { quantity: "200", unit: "ml", name: "Wasser (ggf. mit Kohlensäure)" },
          { quantity: "1", unit: "TL", name: "Salz" },
          { quantity: "1", unit: "Prise", name: "Muskatnuss, frisch gerieben" }
        ]
      },
      {
        sectionTitle: "Für die Fertigstellung",
        items: [
          { quantity: "300", unit: "g", name: "kräftiger Bergkäse, gerieben" },
          { quantity: "100", unit: "g", name: "Emmentaler, gerieben" },
          { quantity: "2", unit: "Stk.", name: "große Zwiebeln" },
          { quantity: "3", unit: "EL", name: "Butter" },
          { quantity: "", unit: "", name: "Salz, Pfeffer" },
          { quantity: "", unit: "", name: "Schnittlauch, in Röllchen zum Garnieren" }
        ]
      }
    ],
    instructions: [
      "Für den Teig Mehl, Eier, Salz und Muskatnuss in eine Schüssel geben. Nach und nach das Wasser hinzufügen und mit einem Holzlöffel zu einem glatten, zähen Teig schlagen. Den Teig so lange kräftig schlagen, bis er Blasen wirft. 10 Minuten ruhen lassen.",
      "In einem großen Topf reichlich Salzwasser zum Kochen bringen.",
      "Den Spätzleteig portionsweise durch eine Spätzlepresse oder von einem Spätzlebrett ins kochende Wasser schaben/drücken. Sobald die Spätzle an der Oberfläche schwimmen, sind sie gar. Mit einer Schaumkelle herausheben.",
      "Sofort eine Schicht geriebenen Käse über die heißen Spätzle streuen. Den Vorgang (Spätzle kochen, abtropfen, mit Käse schichten) wiederholen, bis der Teig aufgebraucht ist. Mit einer Schicht Käse abschließen.",
      "Die Zwiebeln in dünne Ringe schneiden. In einer Pfanne die Butter erhitzen und die Zwiebelringe darin bei mittlerer Hitze langsam goldbraun und knusprig rösten.",
      "Die Käsespätzle auf Tellern anrichten, mit den Röstzwiebeln bestreuen und mit frischem Schnittlauch garnieren. Mit frisch gemahlenem Pfeffer servieren."
    ],
    nutritionPerServing: { calories: "681 kcal", protein: "8.8 g", fat: "27.5 g", carbs: "81 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch", "Deutsch-Schwäbisch"],
      occasion: ["Alltagsküche", "Wochenende"],
      mainIngredient: ["Pasta", "Käse"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Die richtige Teigkonsistenz",
            content: "Der perfekte Spätzleteig ist „zähelastisch“ – flüssig genug, um durch eine Presse zu passen, aber fest genug, um seine Form zu halten. Dies wird durch das kräftige Schlagen des Teigs erreicht, was das Gluten im Mehl entwickelt."
        }
    ]
  },
  {
    recipeTitle: "Königsberger Klopse",
    shortDescription: "Ein Klassiker der ostpreußischen Küche. Zarte Kochklopse aus gemischtem Hackfleisch, verfeinert mit Sardellen, in einer cremigen, weißen Kapernsoße. Ein einfaches, aber raffiniertes Gericht, das traditionell mit Salzkartoffeln serviert wird.",
    prepTime: "20 Min.",
    cookTime: "20 Min.",
    totalTime: "40 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für die Klopse",
        items: [
          { quantity: "500", unit: "g", name: "gemischtes Hackfleisch" },
          { quantity: "1", unit: "Stk.", name: "altbackenes Brötchen" },
          { quantity: "1", unit: "Stk.", name: "Zwiebel" },
          { quantity: "1", unit: "Stk.", name: "Ei" },
          { quantity: "2", unit: "TL", name: "Sardellenpaste oder 4 Sardellenfilets" },
          { quantity: "", unit: "", name: "Salz, Pfeffer" }
        ]
      },
      {
        sectionTitle: "Für die Brühe",
        items: [
          { quantity: "1.5", unit: "l", name: "Wasser" },
          { quantity: "1", unit: "Stk.", name: "Zwiebel" },
          { quantity: "2", unit: "Stk.", name: "Lorbeerblätter" },
          { quantity: "5", unit: "Stk.", name: "Pimentkörner" }
        ]
      },
      {
        sectionTitle: "Für die Soße",
        items: [
          { quantity: "40", unit: "g", name: "Butter" },
          { quantity: "40", unit: "g", name: "Mehl" },
          { quantity: "750", unit: "ml", name: "Kochbrühe der Klopse" },
          { quantity: "100", unit: "ml", name: "Sahne" },
          { quantity: "1", unit: "Stk.", name: "Eigelb" },
          { quantity: "3-4", unit: "EL", name: "Kapern" },
          { quantity: "1", unit: "Schuss", name: "Zitronensaft" },
          { quantity: "", unit: "", name: "Salz, Pfeffer, Zucker" }
        ]
      }
    ],
    instructions: [
      "Für die Klopse das Brötchen in Wasser einweichen und gut ausdrücken. Die Zwiebel fein würfeln. Hackfleisch mit Brötchen, Zwiebel, Ei und Sardellenpaste verkneten. Mit Salz und Pfeffer kräftig würzen.",
      "Aus der Masse mit angefeuchteten Händen ca. 12 gleichmäßige Klopse formen.",
      "Für die Brühe Wasser mit der halbierten Zwiebel, Lorbeerblättern und Pimentkörnern aufkochen. Die Klopse in die siedende (nicht kochende!) Brühe geben und ca. 15 Minuten gar ziehen lassen.",
      "Die fertigen Klopse mit einer Schaumkelle aus der Brühe heben und warm stellen. Die Brühe durch ein Sieb gießen und 750 ml abmessen.",
      "Für die Soße die Butter in einem Topf schmelzen, das Mehl einrühren und kurz anschwitzen (Mehlschwitze). Mit der abgemessenen Brühe unter ständigem Rühren ablöschen, sodass keine Klümpchen entstehen. Die Soße ca. 5 Minuten köcheln lassen.",
      "Sahne und Eigelb verquirlen. Den Topf vom Herd ziehen und die Sahne-Ei-Mischung unter die nicht mehr kochende Soße rühren. Nicht mehr kochen lassen, sonst gerinnt das Eigelb!",
      "Die Kapern (mit etwas Sud) und Zitronensaft zugeben. Die Soße mit Salz, Pfeffer und einer Prise Zucker abschmecken.",
      "Die Klopse in die heiße Soße geben und kurz durchwärmen. Mit Salzkartoffeln und Roter Bete servieren."
    ],
    nutritionPerServing: { calories: "515 kcal", protein: "33 g", fat: "39 g", carbs: "16 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch", "Deutsch-Ostpreußisch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Hackfleisch"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        { title: "Sardellen sind kein Muss", content: "Wer den Geschmack von Sardellen nicht mag, kann sie weglassen. Sie geben dem Gericht aber die klassische, würzige Note." }
    ]
  },
  {
    recipeTitle: "Schwäbische Maultaschen (in der Brühe)",
    shortDescription: "Das kulinarische Aushängeschild Schwabens, auch 'Herrgottsbscheißerle' genannt. Hausgemachte Nudelteigtaschen mit einer herzhaften Füllung aus Brät, Hackfleisch, geräuchertem Speck und Spinat. Klassisch werden sie in einer kräftigen Rinderbrühe serviert.",
    prepTime: "45 Min.",
    cookTime: "15 Min.",
    totalTime: "1 Std.",
    servings: "4-6 Personen",
    difficulty: "Mittel",
    ingredients: [
        {
            sectionTitle: "Für den Nudelteig",
            items: [
              { quantity: "300", unit: "g", name: "Mehl (Type 405)" },
              { quantity: "3", unit: "Stk.", name: "Eier" },
              { quantity: "1", unit: "EL", name: "Öl" },
              { quantity: "0.5", unit: "TL", name: "Salz" }
            ]
        },
        {
            sectionTitle: "Für die Füllung",
            items: [
              { quantity: "150", unit: "g", name: "Kalbsbrät" },
              { quantity: "150", unit: "g", name: "gemischtes Hackfleisch" },
              { quantity: "50", unit: "g", name: "geräucherter Speck, gewürfelt" },
              { quantity: "1", unit: "Stk.", name: "altbackenes Brötchen" },
              { quantity: "1", unit: "Stk.", name: "Zwiebel" },
              { quantity: "100", unit: "g", name: "Blattspinat, blanchiert" },
              { quantity: "1", unit: "Bund", name: "Petersilie, gehackt" },
              { quantity: "1", unit: "Stk.", name: "Ei" },
              { quantity: "", unit: "", name: "Salz, Pfeffer, Muskatnuss" }
            ]
        },
        {
            sectionTitle: "Zum Servieren",
            items: [
              { quantity: "1.5", unit: "l", name: "kräftige Rinderbrühe" },
              { quantity: "", unit: "", name: "Schnittlauch, in Röllchen" }
            ]
        }
    ],
    instructions: [
        "Für den Teig alle Zutaten zu einem glatten, festen Nudelteig verkneten. In Folie wickeln und 30 Minuten bei Raumtemperatur ruhen lassen.",
        "Für die Füllung das Brötchen einweichen und gut ausdrücken. Die Zwiebel und den Speck fein würfeln und in einer Pfanne glasig dünsten. Den Spinat gut ausdrücken und fein hacken.",
        "Brät, Hackfleisch, die Zwiebel-Speck-Mischung, das Brötchen, Spinat, Petersilie und Ei in einer Schüssel gut vermengen. Kräftig mit Salz, Pfeffer und Muskatnuss würzen.",
        "Den Nudelteig auf einer bemehlten Fläche sehr dünn (ca. 2 mm) zu einem großen Rechteck ausrollen.",
        "Die Füllung gleichmäßig auf einer Hälfte des Teigrechtecks verteilen, dabei einen Rand frei lassen. Die andere Teighälfte darüber klappen und die Ränder gut andrücken.",
        "Mit einem Kochlöffelstiel oder Lineal in regelmäßigen Abständen (ca. 4-5 cm) Portionen abdrücken. Mit einem Teigrädchen oder Messer die Maultaschen voneinander trennen.",
        "In einem großen Topf Salzwasser zum Sieden bringen. Die Maultaschen hineingeben und ca. 10-15 Minuten gar ziehen lassen. Sie sollten nicht sprudelnd kochen.",
        "Die fertigen Maultaschen mit einer Schaumkelle herausheben und in der heißen Rinderbrühe servieren. Mit Schnittlauch bestreuen."
    ],
    nutritionPerServing: { calories: "597 kcal", protein: "24 g", fat: "23 g", carbs: "68 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch", "Deutsch-Schwäbisch"],
      occasion: ["Wochenende"],
      mainIngredient: ["Hackfleisch", "Pasta"],
      prepMethod: ["One-Pot"],
      diet: []
    },
    expertTips: [
        { title: "Alternative Zubereitung", content: "Maultaschen schmecken auch hervorragend 'geschmälzt' (in Butter mit Zwiebeln geschwenkt) oder 'geröstet' (in Streifen geschnitten und mit Ei angebraten)." }
    ]
  },
  {
    recipeTitle: "Schwarzwälder Kirschtorte",
    shortDescription: "Der weltberühmte Tortenklassiker aus Deutschland. Saftige Schokoladen-Biskuitböden, getränkt mit Kirschwasser, gefüllt mit einer fruchtigen Kirschfüllung und luftiger Sahne, umhüllt von Schokoladenraspeln. Ein Meisterwerk für besondere Anlässe.",
    prepTime: "60 Min.",
    cookTime: "35 Min.",
    totalTime: "1 Std. 35 Min.",
    servings: "1 Torte (12 Stücke)",
    difficulty: "Anspruchsvoll",
    ingredients: [
        {
            sectionTitle: "Für den Schokoladenbiskuit",
            items: [
                { quantity: "6", unit: "Stk.", name: "Eier" },
                { quantity: "200", unit: "g", name: "Zucker" },
                { quantity: "1", unit: "Päckchen", name: "Vanillezucker" },
                { quantity: "150", unit: "g", name: "Mehl" },
                { quantity: "50", unit: "g", name: "Speisestärke" },
                { quantity: "50", unit: "g", name: "Kakaopulver" },
                { quantity: "1", unit: "TL", name: "Backpulver" }
            ]
        },
        {
            sectionTitle: "Für die Kirschfüllung",
            items: [
                { quantity: "1", unit: "Glas", name: "Sauerkirschen (Abtropfgewicht ca. 350g)" },
                { quantity: "250", unit: "ml", name: "Kirschsaft (aus dem Glas)" },
                { quantity: "25", unit: "g", name: "Speisestärke" },
                { quantity: "2", unit: "EL", name: "Zucker" },
                { quantity: "4", unit: "EL", name: "Kirschwasser" }
            ]
        },
        {
            sectionTitle: "Für die Sahnefüllung & Dekoration",
            items: [
                { quantity: "800", unit: "ml", name: "kalte Schlagsahne" },
                { quantity: "3", unit: "Päckchen", name: "Sahnesteif" },
                { quantity: "50", unit: "g", name: "Puderzucker" },
                { quantity: "100", unit: "g", name: "Zartbitter-Schokoladenraspel" },
                { quantity: "12", unit: "Stk.", name: "frische Kirschen oder Belegkirschen" }
            ]
        }
    ],
    instructions: [
        "Für den Biskuit den Backofen auf 180°C Ober-/Unterhitze vorheizen. Eine Springform (26 cm) einfetten und mit Mehl ausstäuben.",
        "Eier, Zucker und Vanillezucker ca. 10 Minuten schaumig schlagen, bis die Masse hell und cremig ist. Mehl, Stärke, Kakao und Backpulver mischen, auf die Eimasse sieben und vorsichtig unterheben.",
        "Den Teig in die Form füllen und ca. 30-35 Minuten backen. Stäbchenprobe machen. Den Boden vollständig auskühlen lassen.",
        "Für die Füllung die Kirschen abtropfen lassen, den Saft auffangen. 5 EL Saft mit Stärke und Zucker glatt rühren. Restlichen Saft aufkochen, die Stärkemischung einrühren und kurz aufkochen lassen, bis es andickt. Die Kirschen unterheben und abkühlen lassen. Zum Schluss das Kirschwasser einrühren.",
        "Den ausgekühlten Biskuitboden zweimal waagerecht durchschneiden, sodass drei Böden entstehen.",
        "Den untersten Boden auf eine Tortenplatte legen, mit etwas Kirschwasser beträufeln und die Hälfte der Kirschfüllung darauf verteilen.",
        "Sahne mit Sahnesteif und Puderzucker steif schlagen. Etwa ein Drittel der Sahne auf die Kirschen streichen. Den zweiten Boden auflegen, ebenfalls mit Kirschwasser beträufeln und die restliche Kirschfüllung und ein weiteres Drittel Sahne darauf verteilen.",
        "Den dritten Boden auflegen. Die Torte komplett mit der restlichen Sahne einstreichen. Den Rand und die Mitte der Torte mit Schokoladenraspeln bestreuen.",
        "12 Sahnetupfen auf den Tortenrand spritzen und mit je einer Kirsche verzieren. Die Torte mindestens 2 Stunden kalt stellen."
    ],
    nutritionPerServing: { calories: "415 kcal", protein: "5 g", fat: "20 g", carbs: "48 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Deutsch"],
      occasion: ["Feiertage", "Für Gäste"],
      mainIngredient: ["Schokolade", "Kirsche"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        { title: "Biskuitboden am Vortag backen", content: "Der Biskuit lässt sich besser schneiden, wenn er einen Tag vorher zubereitet wird. Gut in Folie eingewickelt bleibt er saftig." }
    ]
  },
  {
    recipeTitle: "Frankfurter Kranz",
    shortDescription: "Ein Klassiker der deutschen Konditorkunst. Ein lockerer Rührteig-Kranz, der zweimal durchgeschnitten und mit einer feinen deutschen Buttercreme und Konfitüre gefüllt wird. Ummantelt mit Krokant und verziert mit Belegkirschen ist er eine Zierde für jede Kaffeetafel.",
    prepTime: "45 Min.",
    cookTime: "45 Min.",
    totalTime: "1 Std. 30 Min. (+ Kühlzeit)",
    servings: "1 Kranz (16 Stücke)",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für den Teig",
        items: [
            { quantity: "250", unit: "g", name: "weiche Butter" },
            { quantity: "250", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Päckchen", name: "Vanillezucker" },
            { quantity: "5", unit: "Stk.", name: "Eier" },
            { quantity: "250", unit: "g", name: "Mehl" },
            { quantity: "100", unit: "g", name: "Speisestärke" },
            { quantity: "3", unit: "TL", name: "Backpulver" }
        ]
      },
      {
        sectionTitle: "Für die Pudding-Buttercreme & Füllung",
        items: [
            { quantity: "1", unit: "Päckchen", name: "Vanillepuddingpulver" },
            { quantity: "500", unit: "ml", name: "Milch" },
            { quantity: "50", unit: "g", name: "Zucker" },
            { quantity: "250", unit: "g", name: "weiche Butter" },
            { quantity: "4", unit: "EL", name: "rote Konfitüre (z.B. Johannisbeere)" }
        ]
      },
      {
        sectionTitle: "Für die Dekoration",
        items: [
            { quantity: "150", unit: "g", name: "Haselnuss- oder Mandelkrokant" },
            { quantity: "8", unit: "Stk.", name: "Belegkirschen" }
        ]
      }
    ],
    instructions: [
      "Den Backofen auf 175°C Ober-/Unterhitze vorheizen. Eine Kranzform (26 cm) gut einfetten und mit Mehl ausstäuben.",
      "Für den Teig die weiche Butter mit Zucker und Vanillezucker cremig rühren. Die Eier einzeln nacheinander unterrühren.",
      "Mehl, Speisestärke und Backpulver mischen und abwechselnd mit der Milch kurz unter den Teig rühren.",
      "Den Teig in die vorbereitete Form füllen und glatt streichen. Ca. 45 Minuten backen (Stäbchenprobe). Den Kranz vollständig auskühlen lassen.",
      "Für die Buttercreme das Puddingpulver mit Zucker und 6 EL von der Milch glatt rühren. Die restliche Milch aufkochen, das angerührte Pulver einrühren und unter Rühren kurz aufkochen lassen. Den Pudding direkt mit Frischhaltefolie abdecken und auf Zimmertemperatur abkühlen lassen.",
      "Die zimmerwarme Butter mit dem Handrührgerät weiß-cremig aufschlagen. Den zimmerwarmen Pudding löffelweise unterschlagen, bis eine glatte Creme entsteht.",
      "Den ausgekühlten Kranz zweimal waagerecht durchschneiden, sodass drei Böden entstehen.",
      "Den unteren Boden mit der Hälfte der Konfitüre bestreichen. Ein Viertel der Buttercreme darauf verteilen. Den mittleren Boden auflegen, mit der restlichen Konfitüre und einem weiteren Viertel der Buttercreme bestreichen.",
      "Den Deckel auflegen. Den Kranz rundherum dünn mit etwas Creme einstreichen (Krümelschicht). Kurz kalt stellen.",
      "Den Kranz mit der restlichen Buttercreme komplett einstreichen. Den Krokant an den Rand und auf die Oberseite drücken.",
      "Mit einem Spritzbeutel 8-12 Sahnetupfen auf den Kranz spritzen und mit den halbierten Belegkirschen garnieren. Bis zum Servieren kalt stellen."
    ],
    nutritionPerServing: { calories: "450 kcal", protein: "5 g", fat: "25 g", carbs: "50 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Deutsch"],
      occasion: ["Feiertage", "Für Gäste"],
      mainIngredient: ["Mandel"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Perfekte Buttercreme",
            content: "Das A und O für eine gelingsichere deutsche Buttercreme ist, dass Pudding und Butter exakt die gleiche Zimmertemperatur haben. Andernfalls gerinnt die Creme. Nehmen Sie beides rechtzeitig aus dem Kühlschrank."
        }
    ]
  },
  {
    recipeTitle: "Donauwelle",
    shortDescription: "Ein beliebter Blechkuchen-Klassiker, auch als 'Schneewittchenkuchen' bekannt. Auf einem hellen und einem dunklen Rührteig versinken saftige Sauerkirschen, bedeckt von einer feinen Vanille-Buttercreme und einer knackigen Schokoladenglasur mit Wellenmuster.",
    prepTime: "40 Min.",
    cookTime: "25 Min.",
    totalTime: "1 Std. 5 Min. (+ Kühlzeit)",
    servings: "1 Blech (ca. 20 Stücke)",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für den Teig",
        items: [
            { quantity: "250", unit: "g", name: "weiche Butter" },
            { quantity: "200", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Päckchen", name: "Vanillezucker" },
            { quantity: "5", unit: "Stk.", name: "Eier" },
            { quantity: "375", unit: "g", name: "Mehl" },
            { quantity: "3", unit: "TL", name: "Backpulver" },
            { quantity: "2", unit: "EL", name: "Kakaopulver" },
            { quantity: "2", unit: "EL", name: "Milch" },
            { quantity: "1", unit: "Glas", name: "Sauerkirschen" }
        ]
      },
      {
        sectionTitle: "Für die Buttercreme",
        items: [
            { quantity: "1", unit: "Päckchen", name: "Vanillepuddingpulver" },
            { quantity: "500", unit: "ml", name: "Milch" },
            { quantity: "40", unit: "g", name: "Zucker" },
            { quantity: "250", unit: "g", name: "weiche Butter" }
        ]
      },
      {
        sectionTitle: "Für die Glasur",
        items: [
            { quantity: "200", unit: "g", name: "Zartbitterkuvertüre" },
            { quantity: "20", unit: "g", name: "Kokosfett" }
        ]
      }
    ],
    instructions: [
        "Backofen auf 180°C Ober-/Unterhitze vorheizen. Ein tiefes Backblech fetten und mit Mehl ausstäuben. Die Sauerkirschen gut abtropfen lassen.",
        "Für den Teig Butter, Zucker und Vanillezucker cremig rühren. Eier einzeln unterrühren. Mehl mit Backpulver mischen und abwechselnd mit etwas Milch unterrühren.",
        "Die Hälfte des Teiges auf dem Backblech verstreichen. Unter die andere Hälfte Kakao und 2 EL Milch rühren und den dunklen Teig auf dem hellen Teig verteilen.",
        "Die abgetropften Kirschen auf dem dunklen Teig verteilen und leicht eindrücken. Ca. 25-30 Minuten backen. Vollständig auskühlen lassen.",
        "Für die Creme Puddingpulver mit Zucker und etwas Milch anrühren. Restliche Milch aufkochen, Pulver einrühren und einen Pudding kochen. Mit Folie abdecken und auf Zimmertemperatur abkühlen lassen.",
        "Die zimmerwarme Butter cremig aufschlagen und den Pudding löffelweise unterschlagen. Die Buttercreme auf dem kalten Kuchen verstreichen und den Kuchen kalt stellen.",
        "Kuvertüre mit Kokosfett im Wasserbad schmelzen, etwas abkühlen lassen und auf der festen Buttercreme verteilen.",
        "Mit einer Gabel oder einem Tortenkamm das typische Wellenmuster in die noch weiche Schokolade ziehen. Den Kuchen bis zum Servieren kalt stellen."
    ],
    nutritionPerServing: { calories: "350 kcal", protein: "4 g", fat: "20 g", carbs: "38 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Deutsch"],
      occasion: ["Geburtstag", "Party"],
      mainIngredient: ["Schokolade", "Kirsche"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Wellenmuster leicht gemacht",
            content: "Das Wellenmuster gelingt am besten, wenn die Schokoladenglasur nicht mehr zu flüssig, aber auch noch nicht fest ist. Arbeiten Sie zügig, nachdem Sie die Glasur aufgetragen haben."
        }
    ]
  },
  {
    recipeTitle: "Klassischer Käsekuchen mit Quark",
    shortDescription: "Ein zeitloser deutscher Klassiker, der auf keiner Kaffeetafel fehlen darf. Cremige Quarkfüllung auf einem knusprigen Mürbeteigboden. Dieses Rezept gelingt garantiert und schmeckt wie von Oma.",
    prepTime: "25 Min.",
    cookTime: "90 Min.",
    totalTime: "1 Std. 55 Min. (+ Kühlzeit)",
    servings: "1 Kuchen (12 Stücke)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für den Mürbeteig",
        items: [
            { quantity: "200", unit: "g", name: "Mehl" },
            { quantity: "75", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Päckchen", name: "Vanillezucker" },
            { quantity: "1", unit: "Prise", name: "Salz" },
            { quantity: "1", unit: "Stk.", name: "Ei" },
            { quantity: "100", unit: "g", name: "kalte Butter" }
        ]
      },
      {
        sectionTitle: "Für die Quarkfüllung",
        items: [
            { quantity: "1", unit: "kg", name: "Magerquark" },
            { quantity: "250", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Päckchen", name: "Vanillepuddingpulver" },
            { quantity: "4", unit: "Stk.", name: "Eier" },
            { quantity: "250", unit: "ml", name: "Milch" },
            { quantity: "125", unit: "ml", name: "Öl" },
            { quantity: "1", unit: "Stk.", name: "Bio-Zitrone (Abrieb und Saft)" }
        ]
      }
    ],
    instructions: [
        "Für den Mürbeteig alle Zutaten rasch zu einem glatten Teig verkneten. In Folie wickeln und 30 Minuten kalt stellen.",
        "Den Backofen auf 160°C Ober-/Unterhitze vorheizen. Eine Springform (26 cm) einfetten.",
        "Den Mürbeteig auf dem Boden der Springform ausrollen und einen ca. 4 cm hohen Rand formen.",
        "Für die Füllung den Quark mit Zucker, Vanillepuddingpulver und den Eiern glatt rühren.",
        "Nach und nach Milch und Öl unterrühren. Zum Schluss Zitronensaft und -abrieb hinzufügen und alles zu einer homogenen Masse verrühren.",
        "Die Quarkmasse auf den Mürbeteigboden gießen.",
        "Den Käsekuchen im vorgeheizten Ofen auf der untersten Schiene ca. 90 Minuten backen. Nach der Backzeit den Ofen ausschalten, einen Kochlöffel in die Ofentür klemmen und den Kuchen im Ofen langsam auskühlen lassen.",
        "Den vollständig ausgekühlten Kuchen aus der Form lösen und bis zum Servieren kalt stellen."
    ],
    nutritionPerServing: { calories: "380 kcal", protein: "13 g", fat: "18 g", carbs: "41 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Deutsch"],
      occasion: ["Alltagsküche", "Für Gäste"],
      mainIngredient: ["Quark"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Reißen der Oberfläche verhindern",
            content: "Käsekuchen reißt oft, wenn er zu schnell abkühlt. Lassen Sie ihn daher unbedingt bei leicht geöffneter Tür im ausgeschalteten Ofen langsam auskühlen. Das verhindert einen Temperaturschock."
        }
    ]
  },
  {
    recipeTitle: "Saftiger Marmorkuchen",
    shortDescription: "Ein Rührkuchen-Klassiker aus der Gugelhupf-Form, der Kindheitserinnerungen weckt. Ein heller und ein dunkler Kakaoteig werden ineinander verschlungen und ergeben die typische Marmorierung. Dieses Rezept garantiert ein besonders saftiges Ergebnis.",
    prepTime: "20 Min.",
    cookTime: "60 Min.",
    totalTime: "1 Std. 20 Min.",
    servings: "1 Gugelhupf (16 Stücke)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "250", unit: "g", name: "weiche Butter" },
            { quantity: "200", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "Päckchen", name: "Vanillezucker" },
            { quantity: "4", unit: "Stk.", name: "Eier" },
            { quantity: "500", unit: "g", name: "Mehl" },
            { quantity: "1", unit: "Päckchen", name: "Backpulver" },
            { quantity: "250", unit: "ml", name: "Milch" },
            { quantity: "3", unit: "EL", name: "Kakaopulver" },
            { quantity: "2", unit: "EL", name: "Zucker (für Kakaoteig)" },
            { quantity: "3", unit: "EL", name: "Milch (für Kakaoteig)" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf 180°C Ober-/Unterhitze vorheizen. Eine Gugelhupf-Form gut einfetten und mit Mehl ausstäuben.",
        "Die weiche Butter mit Zucker und Vanillezucker sehr cremig rühren.",
        "Die Eier einzeln nacheinander gründlich unterrühren.",
        "Mehl und Backpulver mischen und sieben. Abwechselnd mit der Milch kurz unter den Teig rühren, nur so lange, bis alles vermischt ist.",
        "Etwa zwei Drittel des Teiges in die vorbereitete Form füllen.",
        "Zum restlichen Drittel des Teiges das Kakaopulver, den zusätzlichen Zucker und die zusätzliche Milch geben und gut verrühren.",
        "Den dunklen Teig auf dem hellen Teig in der Form verteilen.",
        "Mit einer Gabel spiralförmig durch die beiden Teigschichten ziehen, um das Marmormuster zu erzeugen.",
        "Den Kuchen im vorgeheizten Ofen ca. 60 Minuten backen. Stäbchenprobe machen.",
        "Den Kuchen kurz in der Form abkühlen lassen, dann auf ein Kuchengitter stürzen und vollständig auskühlen lassen. Nach Belieben mit Puderzucker bestäuben oder mit Schokoladenglasur überziehen."
    ],
    nutritionPerServing: { calories: "243 kcal", protein: "11.7 g", fat: "11.3 g", carbs: "30 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Deutsch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Schokolade"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Besonders saftig",
            content: "Für extra Saftigkeit kann ein Teil der Milch durch Eierlikör oder saure Sahne ersetzt werden. Dies macht den Kuchen noch lockerer und geschmackvoller."
        }
    ]
  },
  {
    recipeTitle: "Wiener Apfelstrudel",
    shortDescription: "Der Klassiker der Wiener Kaffeehauskultur. Hauchdünner Strudelteig, gefüllt mit säuerlichen Äpfeln, Rosinen und in Butter gerösteten Semmelbröseln, mit Puderzucker bestäubt. Schmeckt am besten lauwarm mit Vanillesauce oder einer Kugel Vanilleeis.",
    prepTime: "20 Min.",
    cookTime: "30 Min.",
    totalTime: "50 Min.",
    servings: "1 Strudel (6-8 Stücke)",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "Pckg.", name: "Strudelteig (Kühlregal, ca. 270g)" },
            { quantity: "1", unit: "kg", name: "säuerliche Äpfel (z.B. Boskop)" },
            { quantity: "100", unit: "g", name: "Zucker" },
            { quantity: "1", unit: "TL", name: "Zimt" },
            { quantity: "80", unit: "g", name: "Rosinen (optional in Rum eingeweicht)" },
            { quantity: "50", unit: "g", name: "Semmelbrösel" },
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "50", unit: "g", name: "flüssige Butter (zum Bestreichen)" },
            { quantity: "", unit: "", name: "Puderzucker zum Bestäuben" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf 200°C Ober-/Unterhitze vorheizen. Ein Backblech mit Backpapier auslegen.",
        "Die Äpfel schälen, vierteln, entkernen und in dünne Scheiben schneiden oder hobeln. Mit Zucker, Zimt und Rosinen mischen.",
        "In einer Pfanne 50g Butter schmelzen und die Semmelbrösel darin goldbraun anrösten. Abkühlen lassen.",
        "Den Strudelteig vorsichtig auf einem sauberen Küchentuch entrollen.",
        "Die gerösteten Semmelbrösel auf dem Teig verteilen, dabei an den Rändern etwas Platz lassen. Die Apfelmischung gleichmäßig darauf verteilen.",
        "Die Längsseiten des Teiges leicht einschlagen. Den Strudel mithilfe des Küchentuchs von der langen Seite her fest aufrollen.",
        "Den Strudel mit der Naht nach unten auf das Backblech legen. Mit der flüssigen Butter großzügig bestreichen.",
        "Im vorgeheizten Ofen ca. 30 Minuten goldbraun backen. Während des Backens noch 1-2 Mal mit flüssiger Butter bestreichen.",
        "Den fertigen Strudel aus dem Ofen nehmen, kurz abkühlen lassen und dick mit Puderzucker bestäuben. Lauwarm servieren."
    ],
    nutritionPerServing: { calories: "495 kcal", protein: "6 g", fat: "21 g", carbs: "65 g" },
    tags: {
      course: ["Dessert", "Kuchen"],
      cuisine: ["Österreichisch"],
      occasion: ["Herbst"],
      mainIngredient: ["Apfel"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Kein durchnässter Boden",
            content: "Die in Butter gerösteten Semmelbrösel sind nicht nur für den Geschmack da. Sie saugen den austretenden Apfelsaft auf und verhindern, dass der dünne Teigboden matschig wird."
        }
    ]
  },
  {
    recipeTitle: "Hamburger Labskaus (Original)",
    shortDescription: "Ein traditionelles Seemannsgericht aus dem Norden Deutschlands. Herzhafter Brei aus Pökelfleisch, Kartoffeln und Roter Bete, klassisch serviert mit Spiegelei, Rollmops und Gewürzgurke. Ein deftiges und nahrhaftes Gericht mit langer Geschichte.",
    prepTime: "20 Min.",
    cookTime: "25 Min.",
    totalTime: "45 Min.",
    servings: "2 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "300", unit: "g", name: "Pökelfleisch (Corned Beef aus der Dose)" },
            { quantity: "500", unit: "g", name: "mehlig kochende Kartoffeln" },
            { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
            { quantity: "200", unit: "g", name: "Rote Bete (gekocht)" },
            { quantity: "50", unit: "g", name: "Schmalz oder Butter" },
            { quantity: "", unit: "", name: "Salz, Pfeffer, Muskatnuss" }
        ]
      },
      {
        sectionTitle: "Zum Servieren",
        items: [
            { quantity: "2", unit: "Stk.", name: "Eier" },
            { quantity: "2", unit: "Stk.", name: "Rollmöpse" },
            { quantity: "2", unit: "Stk.", name: "Gewürzgurken" }
        ]
      }
    ],
    instructions: [
        "Die Kartoffeln schälen, würfeln und in Salzwasser weich kochen. Abgießen und kurz ausdampfen lassen.",
        "Die Zwiebel fein würfeln. Die gekochte Rote Bete ebenfalls fein würfeln. Das Corned Beef mit einer Gabel zerzupfen.",
        "In einem großen Topf oder einer tiefen Pfanne das Schmalz erhitzen und die Zwiebelwürfel darin glasig dünsten.",
        "Die gekochten Kartoffeln, die Rote Bete und das Corned Beef zu den Zwiebeln geben.",
        "Alles mit einem Kartoffelstampfer zu einem groben Brei zerstampfen. Es sollten noch Stücke erkennbar sein.",
        "Das Labskaus unter Rühren erhitzen und mit Salz, Pfeffer und frisch geriebener Muskatnuss kräftig abschmecken. Wenn es zu trocken ist, etwas Gurkenwasser oder Brühe unterrühren.",
        "In einer separaten Pfanne zwei Spiegeleier braten.",
        "Das Labskaus auf Tellern anrichten und jeweils mit einem Spiegelei, einem Rollmops und einer Gewürzgurke servieren."
    ],
    nutritionPerServing: { calories: "650 kcal", protein: "35 g", fat: "30 g", carbs: "55 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch"],
      mainIngredient: ["Rind", "Kartoffel"],
      prepMethod: ["Pfannengericht"],
      occasion: ["Alltagsküche"],
      diet: []
    },
    expertTips: [
        {
            title: "Die richtige Konsistenz",
            content: "Original Labskaus ist kein feines Püree, sondern ein grober Stampf. Die Zutaten sollten noch erkennbar sein. Nicht zu lange stampfen!"
        }
    ]
  },
  {
    recipeTitle: "Rheinischer Sauerbraten",
    shortDescription: "Ein traditioneller Schmorbraten aus dem Rheinland, der durch seine süß-saure Soße einzigartig wird. Das Rindfleisch wird über mehrere Tage in einer Essig-Rotwein-Beize mariniert, was es unglaublich zart macht. Die Soße wird klassisch mit Rosinen und Printen oder Lebkuchen gebunden.",
    prepTime: "30 Min. (+ 3-6 Tage Marinierzeit)",
    cookTime: "2 Std.",
    totalTime: "2 Std. 30 Min. (+ Marinierzeit)",
    servings: "6 Personen",
    difficulty: "Anspruchsvoll",
    ingredients: [
      {
        sectionTitle: "Für die Beize",
        items: [
            { quantity: "1.5", unit: "kg", name: "Rindfleisch (aus der Keule)" },
            { quantity: "500", unit: "ml", name: "Rotwein" },
            { quantity: "250", unit: "ml", name: "Rotweinessig" },
            { quantity: "2", unit: "Stk.", name: "Zwiebeln" },
            { quantity: "1", unit: "Stk.", name: "Karotte" },
            { quantity: "5", unit: "Stk.", name: "Wacholderbeeren" },
            { quantity: "2", unit: "Stk.", name: "Lorbeerblätter" }
        ]
      },
      {
        sectionTitle: "Zum Schmoren und für die Soße",
        items: [
            { quantity: "2", unit: "EL", name: "Öl" },
            { quantity: "50", unit: "g", name: "Rosinen" },
            { quantity: "2-3", unit: "Scheiben", name: "Aachener Printen oder Lebkuchen" },
            { quantity: "", unit: "", name: "Salz, Pfeffer" }
        ]
      }
    ],
    instructions: [
        "Für die Beize das Gemüse grob würfeln. Wein, Essig, Gemüse und Gewürze in einem Topf aufkochen und abkühlen lassen.",
        "Das Fleisch in ein passendes Gefäß legen und mit der kalten Beize übergießen, sodass es vollständig bedeckt ist. Zugedeckt im Kühlschrank für 3-6 Tage marinieren, dabei das Fleisch täglich wenden.",
        "Das Fleisch aus der Beize nehmen und gut trocken tupfen. Die Beize durch ein Sieb gießen und die Flüssigkeit auffangen.",
        "Öl in einem Schmortopf erhitzen und das Fleisch von allen Seiten kräftig anbraten. Mit Salz und Pfeffer würzen. Fleisch herausnehmen.",
        "Das abgetropfte Gemüse aus der Beize im Topf anrösten. Mit einem Teil der Beizflüssigkeit ablöschen und den Bratensatz lösen.",
        "Das Fleisch zurück in den Topf geben, die restliche Beizflüssigkeit angießen. Zugedeckt bei schwacher Hitze ca. 2-3 Stunden schmoren, bis das Fleisch zart ist.",
        "Den fertigen Braten aus dem Topf nehmen und warm stellen.",
        "Die Soße durch ein Sieb passieren. Die Rosinen und die zerbröselten Printen/Lebkuchen in die Soße geben und unter Rühren aufkochen, bis die Soße sämig wird. Mit Salz und Pfeffer abschmecken.",
        "Den Braten in Scheiben schneiden und mit der Soße servieren. Klassische Beilagen sind Kartoffelklöße und Apfelmus."
    ],
    nutritionPerServing: { calories: "494 kcal", protein: "50 g", fat: "16 g", carbs: "59 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch"],
      occasion: ["Feiertage", "Wochenende"],
      mainIngredient: ["Rind"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Die richtige Süße",
            content: "Die Kombination aus Rosinen und Printen (oder Lebkuchen) verleiht der Soße ihre typische süß-saure Note. Je nach Geschmack kann die Menge angepasst oder zusätzlich mit etwas Rübenkraut abgeschmeckt werden."
        }
    ]
  },
  {
    recipeTitle: "Grünkohl mit Pinkel (Norddeutscher Klassiker)",
    shortDescription: "Ein deftiges und traditionsreiches Wintergericht aus Norddeutschland. Frisch geernteter Grünkohl wird langsam mit Schmalz, Zwiebeln und Speck geschmort und mit Pinkel (einer geräucherten Grützwurst) sowie oft Kassler oder Kochwurst serviert. Ein wärmendes Gericht, das klassisch zu karamellisierten Kartoffeln gereicht wird.",
    prepTime: "20 Min.",
    cookTime: "1 Std. 30 Min.",
    totalTime: "1 Std. 50 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "kg", name: "frischer Grünkohl" },
            { quantity: "2", unit: "Stk.", name: "Zwiebeln" },
            { quantity: "100", unit: "g", name: "durchwachsener Speck" },
            { quantity: "2", unit: "EL", name: "Schweineschmalz" },
            { quantity: "500", unit: "ml", name: "Brühe" },
            { quantity: "4", unit: "Stk.", name: "Pinkel Würste" },
            { quantity: "4", unit: "Scheiben", name: "Kassler" },
            { quantity: "", unit: "", name: "Salz, Pfeffer, Senf" }
        ]
      }
    ],
    instructions: [
        "Den Grünkohl gründlich waschen, die dicken Stiele entfernen und die Blätter grob hacken. In kochendem Salzwasser kurz blanchieren, abschrecken und gut abtropfen lassen.",
        "Zwiebeln und Speck fein würfeln.",
        "In einem großen Topf das Schmalz erhitzen und den Speck darin auslassen. Die Zwiebeln zugeben und glasig dünsten.",
        "Den abgetropften Grünkohl hinzufügen und kurz mitdünsten.",
        "Mit der Brühe ablöschen und zugedeckt bei schwacher Hitze ca. 90 Minuten schmoren lassen. Gelegentlich umrühren.",
        "Nach ca. 60 Minuten Schmorzeit die Pinkelwürste und das Kassler auf den Grünkohl legen und die restliche Zeit mitgaren lassen.",
        "Vor dem Servieren die Würste und das Fleisch aus dem Topf nehmen. Den Grünkohl kräftig mit Salz, Pfeffer und etwas scharfem Senf abschmecken.",
        "Den Grünkohl auf Tellern anrichten, die Pinkel und das Kassler darauf platzieren. Dazu passen Salzkartoffeln oder karamellisierte kleine Kartoffeln."
    ],
    nutritionPerServing: { calories: "1200 kcal", protein: "45 g", fat: "89 g", carbs: "55 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Deutsch"],
      occasion: ["Saisonal", "Winter"],
      mainIngredient: ["Schwein", "Kohl"],
      prepMethod: ["One-Pot"],
      diet: []
    },
    expertTips: [
        {
            title: "Frost für den Geschmack",
            content: "Traditionell schmeckt Grünkohl am besten, nachdem er den ersten Frost abbekommen hat. Dadurch wandelt sich ein Teil der Stärke in Zucker um, was ihn milder und aromatischer macht."
        }
    ]
  }
];
