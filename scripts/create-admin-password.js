import bcrypt from "bcryptjs";

const password = "burhan";

async function main() {
  const hash = await bcrypt.hash(password, 12);

  console.log("Password:", password);
  console.log("Hash:");
  console.log(hash);
}

main();
