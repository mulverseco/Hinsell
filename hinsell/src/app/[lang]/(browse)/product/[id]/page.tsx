import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ItemMedia } from "@/components/item-media"
import { itemsRead } from "@/core/generated/actions/items"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ItemInfo } from "@/features/product/item-info"
import { ReviewsSection } from "@/features/product/reviews-section"

interface EnhancedProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EnhancedProductPage(props: EnhancedProductPageProps) {
  const { id } = await props.params
  const data = await itemsRead({ path: { id: id } })
  const item = data.data

  if (!item) {
    return <div>Product not found</div>
  }

  return (
    <div className="min-h-screen mx-24 bg-background">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs className="mb-8" items={makeBreadcrumbs(item?.item_group_name, item?.item_group, item?.name)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <ItemMedia media={item?.media || []} alt={item?.name} />
          </div>
          <ItemInfo item={item} />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReviewsSection item={item} />

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
                      <span>{item.id}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="variants">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="font-medium">Variants & Pricing</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {item.variants?.map((variant, index) => (
                      <div key={variant.id || index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Variant {index + 1}</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Sales Price:</span>
                                <span className="font-medium">${variant.sales_price}</span>
                              </div>
                              {variant.wholesale_price && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Wholesale:</span>
                                  <span>${variant.wholesale_price}</span>
                                </div>
                              )}
                              {variant.weight && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Weight:</span>
                                  <span>{variant.weight}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {variant.attributes && (
                              <>
                                <h5 className="font-medium mb-2">Attributes</h5>
                                <div className="space-y-1">
                                  {Object.entries(variant.attributes).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-600 capitalize">{key}:</span>
                                      <span>{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No variants available</p>}
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
                        <span className="text-sm font-bold text-gray-600">
                          {(item.brand || "Store")?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.brand || "Hinsell Store"}</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Verified</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>★★★★☆</span>
                          <span>Active seller</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
