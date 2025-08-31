import { itemsRead } from "@/core/generated/actions"
import { ImageResponse } from "next/og"

export const revalidate = 86400

export const dynamic = "force-static"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image({ params: { slug } }: { params: { slug: string } }) {
  const interRegular = fetch(new URL(`${process.env.LIVE_URL}/fonts/Inter-Regular.ttf`)).then((res) => res.arrayBuffer())
  const interBold = fetch(new URL(`${process.env.LIVE_URL}/fonts/Inter-Bold.ttf`)).then((res) => res.arrayBuffer())

  const product = await itemsRead({ path: { id: slug }})

  return new ImageResponse(
    (
      <div
        style={{
          border: "10px solid black",
          display: "flex",
          height: "100%",
          width: "100%",
          fontWeight: 400,
          background: "white",
        }}
      >
        <div
          style={{
            left: 120,
            top: 40,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "380px",
            height: "430px",
            backgroundColor: "#eaeaea",
          }}
        >
          <img src={product?.data?.media?.[0].file} width={280} height={280} style={{ objectFit: "contain" }} />
        </div>
        <div
          style={{
            left: 120,
            top: 490,
            position: "absolute",
            display: "flex",
            width: "380px",
            height: "80px",
          }}
        >
          {product?.data?.media
            ?.slice(0, 4)
            ?.map((image, idx) => (
              <img
                key={idx}
                style={{
                  marginLeft: idx !== 0 ? "10px" : "0px",
                  backgroundColor: "#eaeaea",
                  border: "1px solid black",
                  padding: "5px",
                }}
                src={image.file}
                width={85}
                height={80}
              />
            ))}
        </div>

        <div
          style={{
            height: "145px",
            overflow: "hidden",
            maxWidth: "450px",
            fontWeight: 400,
            fontSize: "48px",
            lineHeight: 1,
            position: "absolute",
            left: 600,
            top: 40,
            letterSpacing: "-0.05em",
          }}
        >
          {product?.data?.name}
        </div>

        <div
          style={{
            height: "180px",
            overflow: "hidden",
            maxWidth: "500px",
            fontWeight: 400,
            fontSize: "21px",
            position: "absolute",
            left: 600,
            color: "#565656",
            top: 230,
          }}
        >
          {product?.data?.description}
        </div>
        <div
          style={{
            fontSize: "70px",
            fontWeight: 900,
            lineHeight: 1,
            position: "absolute",
            left: 600,
            bottom: 60,
            textAlign: "left",
            letterSpacing: "-0.05em",
          }}
        >
          {product?.data?.variants?.[0]?.sales_price ?? ""}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await interBold,
          style: "normal",
          weight: 900,
        },
      ],
    }
  )
}
