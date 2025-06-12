/**
 * Fetches the latest Deno version from the GitHub API and updates the .deno-version
 * file and the devcontainer.json file with the new version.
 */
const updateDenoVersion = async () => {
  const latestReleaseUrl =
    "https://api.github.com/repos/denoland/deno/releases/latest";

  // Fetch the latest release information from GitHub
  const response = await fetch(latestReleaseUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch latest Deno version: ${response.statusText}`,
    );
  }

  const releaseData = await response.json();
  const latestVersion = releaseData.tag_name.replace(/^v/, "");

  // Update .deno-version
  const denoVersionPath = "./.deno-version";
  await Deno.writeTextFile(denoVersionPath, latestVersion);
  console.log(`Updated .deno-version to ${latestVersion}`);

  // Update devcontainer.json
  const devcontainerPath = "./.devcontainer/devcontainer.json";
  const devcontainerContent = JSON.parse(
    await Deno.readTextFile(devcontainerPath),
  );
  devcontainerContent.build.options = devcontainerContent.build.options.map(
    (option: string) => {
      return option.startsWith("--build-arg=DENO_VERSION=")
        ? `--build-arg=DENO_VERSION=${latestVersion}`
        : option;
    },
  );

  await Deno.writeTextFile(
    devcontainerPath,
    `${JSON.stringify(devcontainerContent, null, 2)}\n`,
  );
  console.log(`Updated devcontainer.json to use Deno version ${latestVersion}`);
};

// Run the update function
try {
  await updateDenoVersion();
} catch (error) {
  console.error(error);
  Deno.exit(1);
}
