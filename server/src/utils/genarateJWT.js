import jwt from "jsonwebtoken"

const genarateJWT = async (payload) => {
  const token = await jwt.sign(
    payload,
    process.env.JWT_SECRET_KEY,
    {expiresIn: "1d"}
  )

  return token
}

export {
  genarateJWT
}