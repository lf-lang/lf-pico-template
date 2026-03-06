{ pkgs ? import <nixpkgs> {} } :
let
  # lf = pkgs.callPackage ./nix/lf.nix {};
  # lingo = pkgs.callPackage ./nix/lingo.nix {};
in 
pkgs.mkShell {
  packages = with pkgs; [
    lolcat
    picotool
    cmake
    gcc-arm-embedded
    openocd
    git
    nodejs
    zellij
    screen
    gdb
  ];
  buildInputs = [
    # lf
    # lingo
  ];

  # set environment variables
  # per "Raspberry Pi Pico-series C/C++ SDK", 7.2 Platform and Board Configuration: "PICO_BOARD=my_board_name in your environment will cause the header my_board_name.h to be included by all other SDK headers in order to provide #defines particular to the board you are using...If PICO_BOARD is specified but not PICO_PLATFORM, PICO_PLATFORM will be set if a value for it is specified in the board header."
  #PICO_BOARD = "pico2_w";  # specify if your board is not plain pico, for example: pico_w, pico2, pico2_w, etc
  PICO_PLATFORM = "";  # intentionally empty valued, allowing board header to set it

  # TODO: integrate dependencies into nix
  shellHook = ''
    echo "[shell] hook start"
    echo "[shell] setup pico-sdk"
    git submodule update --init
    cd pico-sdk/
    git submodule update --init
    export PICO_SDK_PATH="$PWD"
    echo "[shell] PICO_SDK_PATH: $PICO_SDK_PATH" | lolcat
    cd ../
    echo "[shell] copy robot header (pololu_3pi_2040_robot.h)" | lolcat
    cp pololu_3pi_2040_robot.h pico-sdk/src/boards/include/boards/
    echo "[shell] PICO_BOARD: $PICO_BOARD" | lolcat
    echo "[shell] PICO_PLATFORM: $PICO_PLATFORM" | lolcat
    echo "[shell] setup testbed"
    cd test/
    npm install
    cd ../
    echo '[shell] To exit the shell, type `exit` or press `Ctrl`+`D`'
    echo "[shell] hook end"
    '';
}
