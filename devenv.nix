{pkgs, ...}: {
  # https://devenv.sh/basics/
  env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = [pkgs.hugo pkgs.python3 pkgs.go-task];

  # Add go install github.com/hmajid2301/tcardgen@latest as a dep
  # https://devenv.sh/scripts/
  scripts.generate_og.exec = "python ./scripts/og/generate.py";

  enterShell = ''
  '';

  # https://devenv.sh/languages/
  # languages.nix.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";

  # See full reference at https://devenv.sh/reference/options/
}
