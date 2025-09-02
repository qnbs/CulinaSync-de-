import { Recipe } from '@/types';

// This file contains a comprehensive list of recipes to seed the database.
// All recipes have been parsed and structured from the provided documents.

export const seedRecipes: Recipe[] = [
  // =======================================================================
  // Deutsche Küche
  // =======================================================================
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
      difficulty: ["Mittel"],
      totalTime: ["Über 60 Minuten"]
    },
    expertTips: [
      {
        title: "Für eine garantiert knusprige Kruste",
        content: "Die Schwarte des Bratens 30 Minuten vor Ende der Garzeit nicht mehr übergießen. Am Ende die Temperatur stark erhöhen und nur noch Oberhitze oder die Grillfunktion verwenden."
      },
      {
        title: "Soße verfeinern",
        content: "Für eine intensivere Soße das Röstgemüse kräftig anbraten, bevor der Braten daraufgelegt wird. Ein Löffel Senf oder Tomatenmark, mit dem Gemüse angeröstet, verleiht zusätzliche Tiefe."
      },
      {
        title: "Lagerung",
        content: "Übrig gebliebener Schweinebraten schmeckt am nächsten Tag auch kalt aufgeschnitten auf Brot hervorragend."
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
      difficulty: ["Mittel"],
      totalTime: ["Über 60 Minuten"]
    },
    expertTips: [
      {
        title: "Fleischwahl",
        content: "Für besonders zarte Rouladen sollte Fleisch aus der Oberschale verwendet werden. Es ist mager und kurzfaserig."
      },
      {
        title: "Füllungsvarianten",
        content: "Klassisch ist die Füllung mit Speck, Gurke und Zwiebel. Manche regionalen Varianten enthalten auch Hackfleisch, um die Roulade saftiger zu machen."
      },
      {
        title: "Soße mit Pfiff",
        content: "Für eine tiefere Farbe und einen intensiveren Geschmack der Soße das Röstgemüse sehr dunkel anbraten und den Rotwein schluckweise zugeben und immer wieder einkochen lassen, bevor der Fond aufgegossen wird."
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
      difficulty: ["Mittel"],
      totalTime: ["30-60 Minuten"]
    },
    expertTips: [
      {
        title: "Die perfekte Panade",
        content: "Der Schlüssel zum Soufflieren ist, die Panade nicht anzudrücken und das Schnitzel in reichlich heißem Butterschmalz schwimmend auszubacken, während die Pfanne geschwenkt wird."
      },
      {
        title: "Das richtige Fett",
        content: "Traditionell wird Butterschmalz verwendet, da es hocherhitzbar ist und einen feinen Buttergeschmack verleiht. Eine Mischung aus Butterschmalz und neutralem Pflanzenöl ist ebenfalls möglich."
      },
      {
        title: "Fleischqualität",
        content: "Für das Original Wiener Schnitzel ist Kalbfleisch aus der Oberschale vorgeschrieben. Es ist besonders zart und mager."
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
      difficulty: ["Einfach"],
      totalTime: ["30-60 Minuten"]
    },
    expertTips: [
        {
            title: "Die richtige Teigkonsistenz",
            content: "Der perfekte Spätzleteig ist „zähelastisch“ – flüssig genug, um durch eine Presse zu passen, aber fest genug, um seine Form zu halten. Dies wird durch das kräftige Schlagen des Teigs erreicht, was das Gluten im Mehl entwickelt."
        },
        {
            title: "Die entscheidende Käsewahl",
            content: "Authentische Käsespätzle leben vom Geschmack des Käses. Eine Mischung aus einem kräftigen, würzigen Bergkäse und einem milden, gut schmelzenden Käse wie Emmentaler oder Gruyère ist der Schlüssel zum Erfolg."
        },
        {
            title: "Schichten für maximalen Genuss",
            content: "Anstatt den Käse am Ende nur darüber zu streuen, werden traditionelle Käsespätzle geschichtet. Die heißen, abgetropften Spätzle werden direkt in eine vorgewärmte Schüssel gegeben und sofort mit einer Lage Käse bestreut. Dieser Vorgang wird wiederholt."
        }
    ]
  }
];
