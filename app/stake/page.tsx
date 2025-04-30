"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "@/components/ui/hero-section";
import { StakeHero } from "./stake-hero";

// Mock data for validators
const validators = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Validator ${i + 1}`,
  commission: (5 + (i % 5)).toFixed(1),
  apy: (7 + (i % 6)).toFixed(1),
  totalStaked: (1000 * (i + 1)).toFixed(0),
  uptime: (99 + (i % 2) * 0.9).toFixed(1),
  status: i % 10 === 0 ? "Jailed" : "Active",
}));

export default function StakePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const validatorId = searchParams.get("validator");
  const stakeType = searchParams.get("type") || "regular";

  const [selectedValidator, setSelectedValidator] = useState(
    validatorId ? Number.parseInt(validatorId) : null
  );
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);

  const handleValidatorSelect = (id: number) => {
    setSelectedValidator(id);
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleStake = () => {
    // This would be where the actual staking logic would go
    alert(`Staked ${amount} BTC with Validator ${selectedValidator}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <StakeHero />

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue={stakeType} className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="regular">Regular Staking</TabsTrigger>
              <TabsTrigger value="liquid">Liquid Staking</TabsTrigger>
            </TabsList>
            <TabsContent value="regular">
              <Card>
                <CardHeader>
                  <CardTitle>Regular Staking</CardTitle>
                  <CardDescription>
                    Stake your Bitcoin with a validator and earn rewards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Step 1: Choose a Validator
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {validators.slice(0, 6).map((validator) => (
                              <div
                                key={validator.id}
                                className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                                  selectedValidator === validator.id
                                    ? "border-[#ffb70b] bg-[#ffb70b]/5"
                                    : "hover:border-gray-300"
                                }`}
                                onClick={() =>
                                  handleValidatorSelect(validator.id)
                                }
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">
                                      {validator.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Commission: {validator.commission}%
                                    </p>
                                  </div>
                                  {selectedValidator === validator.id && (
                                    <Check className="h-5 w-5 text-[#ffb70b]" />
                                  )}
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                  <span>APY</span>
                                  <span className="font-bold text-green-600">
                                    {validator.apy}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Link
                            href="/validators"
                            className="text-sm text-[#ffb70b] hover:underline"
                          >
                            View all validators
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Step 2: Enter Amount
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (BTC)</Label>
                            <div className="relative">
                              <Input
                                id="amount"
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 text-sm font-medium text-[#ffb70b]"
                                onClick={() => setAmount("0.1")}
                              >
                                MAX
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800">
                                  Staking Information
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  You are about to stake with{" "}
                                  {
                                    validators.find(
                                      (v) => v.id === selectedValidator
                                    )?.name
                                  }
                                  . The current APY is{" "}
                                  {
                                    validators.find(
                                      (v) => v.id === selectedValidator
                                    )?.apy
                                  }
                                  %.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Step 3: Confirm Staking
                        </h3>
                        <div className="space-y-4">
                          <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-4">
                              Staking Summary
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Validator</span>
                                <span>
                                  {
                                    validators.find(
                                      (v) => v.id === selectedValidator
                                    )?.name
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Amount</span>
                                <span>{amount} BTC</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">APY</span>
                                <span className="text-green-600">
                                  {
                                    validators.find(
                                      (v) => v.id === selectedValidator
                                    )?.apy
                                  }
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Commission
                                </span>
                                <span>
                                  {
                                    validators.find(
                                      (v) => v.id === selectedValidator
                                    )?.commission
                                  }
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Unbonding Period
                                </span>
                                <span>7 days</span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800">
                                  Important Information
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  By staking your Bitcoin, you agree to a 7-day
                                  unbonding period when you decide to unstake.
                                  During this period, your Bitcoin will not earn
                                  rewards.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {step > 1 && (
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={
                        (step === 1 && !selectedValidator) ||
                        (step === 2 && !amount)
                      }
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button onClick={handleStake}>Stake Now</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="liquid">
              <Card>
                <CardHeader>
                  <CardTitle>Liquid Staking</CardTitle>
                  <CardDescription>
                    Stake your Bitcoin and receive $SUN tokens that you can use
                    in DeFi applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Step 1: Enter Amount
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (BTC)</Label>
                            <div className="relative">
                              <Input
                                id="amount"
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 text-sm font-medium text-[#ffb70b]"
                                onClick={() => setAmount("0.1")}
                              >
                                MAX
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800">
                                  Liquid Staking Information
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  When you liquid stake, you receive $SUN tokens
                                  that represent your staked Bitcoin. These
                                  tokens can be used in DeFi applications while
                                  your Bitcoin earns staking rewards.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Step 2: Confirm Liquid Staking
                        </h3>
                        <div className="space-y-4">
                          <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-4">
                              Staking Summary
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Amount</span>
                                <span>{amount} BTC</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  You Receive
                                </span>
                                <span>{amount} $SUN</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Current APY
                                </span>
                                <span className="text-green-600">8.5%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Protocol Fee
                                </span>
                                <span>0.5%</span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800">
                                  Important Information
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  $SUN tokens represent your staked Bitcoin and
                                  can be redeemed at any time. The value of $SUN
                                  increases over time as staking rewards accrue.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {step > 1 && (
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back
                    </Button>
                  )}
                  {step < 2 ? (
                    <Button onClick={handleNextStep} disabled={!amount}>
                      Continue
                    </Button>
                  ) : (
                    <Button onClick={handleStake}>Stake Now</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
