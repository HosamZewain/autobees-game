# Autobees Complete Game

A single-player Arabic word game built with Flutter.

## How to Run

1.  **Install Dependencies**:
    Open your terminal in this directory and run:
    ```bash
    flutter pub get
    ```

1.  **Initialize Project** (Important):
    Since the project was created manually, you must generate the platform-specific code (iOS/Android) first:
    ```bash
    flutter create .
    ```

2.  **Run the App**:
    Connect your device or start a simulator/emulator, then run:
    ```bash
    flutter run
    ```

## Features

-   **Random Letter Generation**: Gets a random Arabic letter for each round.
-   **Timer**: 30, 60, or 90 seconds.
-   **Scoring**: 10 points for each correct word starting with the target letter.
-   **Categories**: Name, Country, Animal, Plant, Inanimate, Profession.

## Troubleshooting

-   If you see "Command not found: flutter", ensure Flutter SDK is installed and in your PATH.
-   If fonts look incorrect, ensure your device supports Arabic script (most do by default).
