{
  pkgs,
  pre-commit-hooks,
  ...
}: let
  pre-commit-check = pre-commit-hooks.lib.${pkgs.system}.run {
    src = ./.;
    hooks = {
      golangci-lint.enable = true;
      gotest.enable = true;
    };
  };
in
  pkgs.mkShell {
    inherit (pre-commit-check) shellHook;

    packages = with pkgs; [
      go_1_22
      golangci-lint
      gotools
      go-junit-report
      gocover-cobertura
      go-task
      goreleaser
      sqlc
      docker-compose
    ];
  }
