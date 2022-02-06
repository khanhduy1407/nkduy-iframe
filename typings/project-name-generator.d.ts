declare module "project-name-generator" {
  export function generate(): {
    raw: string,
    dashed: string,
    spaced: string
  }
}
