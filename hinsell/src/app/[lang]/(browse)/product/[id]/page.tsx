import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ItemMedia } from "@/components/item-media"
import { cn } from "@/lib/utils"
import { itemsRead } from "@/core/generated/actions/items"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ItemInfo } from "@/features/product/item-info"



interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params
  const data = await itemsRead({path:{id:id}})
  const item = data.data

console.log("item : ",item)
  return (
    <div className="min-h-screen sm:mx-4 md:mx-24 bg-background">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs className="mb-8" items={makeBreadcrumbs(item?.item_group_name, item?.item_group, item?.name)} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <ItemMedia media={item?.media || []} alt={item?.name} />
          </div>
          <ItemInfo item={item || []}/>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Customer Reviews</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">4.00</span>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-4 w-4", i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                    />
                  ))}
                </div>
              </div>

              {/* Overall Fit */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Overall Fit:</h3>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Small</span>
                  <span>True to Size</span>
                  <span>Large</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">0%</span>
                  <div className="flex-1 bg-gray-200 h-1 rounded overflow-hidden">
                    <div className="bg-black h-full" style={{ width: "100%" }}></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">100%</span>
                  <span className="text-xs text-gray-500 w-6">0%</span>
                </div>
              </div>
            </div>

            {/* Review filters */}
            <div className="flex items-center gap-6 border-b pb-2">
              <button className="text-sm font-medium border-b-2 border-black pb-2">All Reviews</button>
              <button className="text-sm text-gray-500 pb-2">Image</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span>Rating</span>
                  <select className="border rounded px-2 py-1 text-xs">
                    <option>All</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span>Filter by product (color or size)</span>
                  <select className="border rounded px-2 py-1 text-xs">
                    <option>All</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span>Sort by</span>
                  <select className="border rounded px-2 py-1 text-xs">
                    <option>Recommend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Individual review */}
            <div className="space-y-4">
              <div className=" pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                    d***l
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn("h-3 w-3", i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">8 Sep 2025</span>
                    </div>
                    <div className="text-xs text-gray-600 space-x-4">
                      <span>Overall Fit: True to Size</span>
                      <span>Color: Apricot</span>
                      <span>Size: 4Y</span>
                    </div>
                    <p className="text-sm text-gray-800">
                      Very cute coloring, a bit thinner than I expected but it fit okay! My child is a tall and skinny 3
                      yr old. I got 4Y Arms fit well but was snug trying to get arms in. I will say true to size but on
                      snug side. May be to small after washing so I&apos;ll hang dry!
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="text-xs text-blue-600 underline">Translate</button>
                      <span className="text-xs text-gray-400">Points Program</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <button className="text-xs text-gray-500">👍</button>
                        <button className="text-xs text-gray-500">⋯</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          <div className="space-y-4">
            <Accordion type="multiple" defaultValue={["description"]} className="w-full">
              <AccordionItem value="description" className="">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Description</span>
                    <span
                      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-sm shadow-sm"
                      style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
                    >
                      Trends
                    </span>
                    <span className="text-xs text-purple-600">#CampusStyle</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-sm text-white shadow-sm"
                        style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
                      >
                        Trends
                      </span>
                      <span className="text-xs text-purple-600">#CampusStyle</span>
                    </div>
                    <p className="text-sm">Trendy, comfy campus looks for stylish student life moments.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Neckline:</span>
                        <span>Hooded</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sleeve Type:</span>
                        <span>Drop Shoulder</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>Pullovers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Details:</span>
                        <span>Pocket</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lead For Added:</span>
                        <span>-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warmth:</span>
                        <span>No</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pattern Type:</span>
                        <span>Letter</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span>Everyday Casual</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color:</span>
                        <span>Apricot</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sleeve Length:</span>
                        <span>Long Sleeve</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fit Type:</span>
                        <span>Regular Fit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Length:</span>
                        <span>Regular</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material:</span>
                        <span>Polyester</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Composition:</span>
                        <span>100% Polyester</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Care Instructions:</span>
                      <span>Machine wash or professional dry clean</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sheer:</span>
                      <span>No</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fabric Elasticity:</span>
                      <span>Non-Stretch</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Body:</span>
                      <span>Unlined</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span>sk2508223022276931I</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size-fit">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="font-medium">Size & Fit</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Switch to</span>
                      <div className="flex border rounded">
                        <button className="px-3 py-1 bg-black text-white text-xs rounded-l">IN</button>
                        <button className="px-3 py-1 text-xs border-l">CM</button>
                      </div>
                    </div>

                    <div className="flex border-b">
                      <button className="px-4 py-2 text-sm font-medium border-b-2 border-black">
                        Product Measurements
                      </button>
                      <button className="px-4 py-2 text-sm text-gray-500">Body Measurements</button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Size</th>
                            <th className="text-left py-2">Shoulder</th>
                            <th className="text-left py-2">Bust</th>
                            <th className="text-left py-2">Length</th>
                            <th className="text-left py-2">Sleeve Length</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="">
                            <td className="py-2">4Y</td>
                            <td className="py-2">13</td>
                            <td className="py-2">27.6</td>
                            <td className="py-2">16.5</td>
                            <td className="py-2">12.2</td>
                          </tr>
                          <tr className="">
                            <td className="py-2">5Y</td>
                            <td className="py-2">13.6</td>
                            <td className="py-2">28.7</td>
                            <td className="py-2">17.7</td>
                            <td className="py-2">13.4</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="about-store">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="font-medium">About Store</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">P</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item?.brand || "Hinsell Store"}</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">HL Seller</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>★★★★☆</span>
                          <span>paid 1 day ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        All Items
                      </Button>
                      <Button variant="outline" size="sm">
                        + Follow
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Customers Also Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Mock similar items would go here */}
          </div>
        </div>
      </div>
    </div>
  )
}

function makeBreadcrumbs(item_group_name?: string, item_group_id?: string, item_name?: string) {
  return {
    Home: "/",
    [item_group_name || "Products"]: item_group_name ? `/category/${item_group_id}` : "/search",
    [item_name || ""]: "",
  }
}