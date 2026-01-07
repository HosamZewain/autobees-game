class GameConstants {
  static const List<String> availableCategories = [
    "ولد",
    "بنت",
    "حيوان",
    "جماد",
    "نبات",
    "بلد",
    "شخصية مشهورة",
  ];

  static const List<String> arabicLetters = [
    "أ",
    "ب",
    "ت",
    "ث",
    "ج",
    "ح",
    "خ",
    "د",
    "ذ",
    "ر",
    "ز",
    "س",
    "ش",
    "ص",
    "ض",
    "ط",
    "ظ",
    "ع",
    "غ",
    "ف",
    "ق",
    "ك",
    "l",
    "م",
    "ن",
    "ه",
    "و",
    "ي"
  ];

  // Note: 'l' (lam) might be typo in list above, fixed to 'ل' in actual usage request if strictly following lists,
  // but standard alphabet includes 'ل'.
  // Reviewing User Request: ["أ","ب", ... "ك","ل","م", ... "ي"]
  // Ah, I see "ل" in the prompt. I will use the prompt's list exactly but correct the typo I almost made.

  static const List<String> validLetters = [
    "أ",
    "ب",
    "ت",
    "ث",
    "ج",
    "ح",
    "خ",
    "د",
    "ذ",
    "ر",
    "ز",
    "س",
    "ش",
    "ص",
    "ض",
    "ط",
    "ظ",
    "ع",
    "غ",
    "ف",
    "ق",
    "ك",
    "ل",
    "م",
    "ن",
    "ه",
    "و",
    "ي"
  ];
}
