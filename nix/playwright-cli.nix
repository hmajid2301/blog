{
  lib,
  buildNpmPackage,
  makeWrapper,
  nodejs,
  playwright-driver,
}:
buildNpmPackage {
  pname = "playwright-cli";
  version = "0.1.13";

  src = ./playwright-cli;
  npmDepsHash = "sha256-7rtks7dVjrwNvnSi69E7CpExihoI8Zc34sAxp6ToTSw=";

  nativeBuildInputs = [ makeWrapper ];

  dontNpmBuild = true;

  postInstall = ''
    rm -f "$out/bin/playwright-cli"

    makeWrapper "${nodejs}/bin/node" "$out/bin/playwright-cli" \
      --add-flags "$out/lib/node_modules/gothreads-playwright-cli/node_modules/@playwright/cli/playwright-cli.js" \
      --set-default PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD 1 \
      --set-default PLAYWRIGHT_BROWSERS_PATH "${playwright-driver.browsers}" \
      --set-default PLAYWRIGHT_NODEJS_PATH "${nodejs}/bin/node" \
      --set-default PLAYWRIGHT_DRIVER_PATH "${playwright-driver}"
  '';

  meta = with lib; {
    description = "Playwright CLI wrapped for Nix Playwright environment";
    homepage = "https://github.com/microsoft/playwright-cli";
    license = licenses.asl20;
    platforms = platforms.all;
  };
}
