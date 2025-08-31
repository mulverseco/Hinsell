"use client"

import { X, Tag, Clock, ChevronRight, Sparkles, Gift } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Offer } from "@/core/generated/schemas"

interface PromotionalBarProps {
  offer?: Offer
}

export function PromotionalBar({ offer }: PromotionalBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible || !offer) return null

  const getDiscountText = () => {
    if (offer.discount_percentage) {
      return `${offer.discount_percentage}% OFF`
    }
    if (offer.discount_amount) {
      return `$${offer.discount_amount} OFF`
    }
    return "SPECIAL OFFER"
  }

  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTimeRemaining = (dateString: string) => {
    const endDate = new Date(dateString)
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days <= 0) return "Expired"
    if (days === 1) return "Last day!"
    if (days <= 7) return `${days} days left`
    return `${days} days remaining`
  }

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        {/* Collapsed state - elegant side tab */}
        <div
          className={`bg-gradient-to-b from-amber-500 via-yellow-500 to-amber-600 text-white shadow-2xl transition-all duration-500 ease-out cursor-pointer group ${
            isExpanded ? "translate-x-0" : "translate-x-0"
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {!isExpanded && (
            <div className="flex items-center gap-2 py-4 px-3 rounded-l-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <div className="text-xs font-bold tracking-wider rotate-90 whitespace-nowrap">{getDiscountText()}</div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>

        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
            isExpanded ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-l-3xl shadow-2xl border border-amber-500/20 backdrop-blur-sm">
            <div className="p-8 w-80">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-full">
                    <Gift className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Exclusive Offer
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsVisible(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Discount Badge */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 py-3 rounded-2xl font-bold text-2xl shadow-lg">
                  <Tag className="h-6 w-6" />
                  {getDiscountText()}
                </div>
              </div>

              {/* Offer Details */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xl font-semibold text-center">{offer.name}</h4>
                {offer.description && (
                  <p className="text-gray-300 text-sm leading-relaxed text-center">{offer.description}</p>
                )}
              </div>

              {/* Time Remaining */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Time Remaining</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{getTimeRemaining(offer.end_date)}</div>
                    <div className="text-xs text-gray-400">Ends {formatEndDate(offer.end_date)}</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => {
                  // Handle offer claim/redirect
                  console.log("[v0] Claiming offer:", offer.id)
                }}
              >
                Claim This Offer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
