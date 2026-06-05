import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { invoke } from "@tauri-apps/api/core";

const filePath = "count.txt";

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0"),
    10,
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

const _updateCount = createServerFn({ method: "POST" })
  .inputValidator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount();
    await fs.promises.writeFile(filePath, `${count + data}`);
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          await _updateCount({ data: 1 });
          router.invalidate();
        }}
      >
        Add 1 to {state}?
      </button>
      <button
        type="button"
        onClick={async () => {
          const t = await invoke("greet", { name: "othi" });
          console.log(t);
        }}
      >
        greet: {}
      </button>
    </>
  );
}
