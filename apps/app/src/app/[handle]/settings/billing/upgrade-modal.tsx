"use client";

import { useState } from "react";
import { atomWithToggle } from "@barely/atoms/atom-with-toggle";
import { useWorkspace } from "@barely/hooks/use-workspace";
import { api } from "@barely/server/api/react";
import { WORKSPACE_PLANS } from "@barely/server/workspace.settings";
import { FeatureChecklist } from "@barely/ui/components/feature-checklist";
import { Badge } from "@barely/ui/elements/badge";
import { Button } from "@barely/ui/elements/button";
import { ConfettiBurst } from "@barely/ui/elements/confetti";
import { Modal, ModalBody, ModalHeader } from "@barely/ui/elements/modal";
import { Text } from "@barely/ui/elements/typography";

export const showUpgradeModalAtom = atomWithToggle(false);

// export function UpgradeModal(props: {
//   checkoutSuccessPath?: string;
//   checkoutCancelPath?: string;
// }) {
//   const workspace = useWorkspace();

//   const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
//     "yearly",
//   );
//   const [creatingCheckout, setCreatingCheckout] = useState(false);

//   const { mutate: createUpgradeCheckoutLink } =
//     api.workspace.createCheckoutLink.useMutation({
//       onSuccess: (checkoutLink) => {
//         if (checkoutLink) window.location.replace(checkoutLink);
//       },
//       onError: () => setCreatingCheckout(false),
//     });

//   const triggerUpgradeCheckout = () => {
//     setCreatingCheckout(true);
//     createUpgradeCheckoutLink({
//       planId: "pro",
//       billingCycle,
//       successPath: props.checkoutSuccessPath
//         ? `${workspace.handle}/${props.checkoutSuccessPath}`
//         : undefined,
//       cancelPath: props.checkoutCancelPath
//         ? `${workspace.handle}/${props.checkoutCancelPath}`
//         : undefined,
//     });
//   };

//   const pro = WORKSPACE_PLANS.get("pro");
//   if (!pro) return null;

//   const cost =
//     billingCycle === "monthly"
//       ? pro?.price.monthly.amount
//       : pro?.price.yearly.amount;

//   return (
//     <Modal showModalAtom={showUpgradeModalAtom} className="max-h-fit max-w-lg">
//       <ModalHeader
//         icon="logo"
//         title="Upgrade to Pro"
//         subtitle="Enjoy higher limits and extra features with our Pro plan."
//       />
//       <ModalBody className="">
//         <div className="flex flex-row items-center justify-between">
//           <Text variant="lg/semibold">
//             Pro Yearly{" "}
//             <Badge variant="outline">{`$${cost}/${billingCycle.replace(
//               "ly",
//               "",
//             )}`}</Badge>
//           </Text>
//           <ConfettiBurst active={billingCycle === "yearly"} />
//           <Button
//             variant="link"
//             size="xs"
//             onClick={() =>
//               setBillingCycle(billingCycle === "yearly" ? "monthly" : "yearly")
//             }
//             className="underline"
//           >
//             {billingCycle === "yearly"
//               ? "Switch to monthly"
//               : "Get 2 months free 🎁"}
//           </Button>
//         </div>

//         <FeatureChecklist
//           items={[
//             "Track 50x more link clicks per month",
//             "Access remarketing pixels",
//           ]}
//         />

//         <Button
//           fullWidth
//           className="mt-10"
//           onClick={triggerUpgradeCheckout}
//           loading={creatingCheckout}
//         >
//           Upgrade to Pro {billingCycle === "monthly" ? "Monthly" : "Yearly"}
//         </Button>
//       </ModalBody>
//     </Modal>
//   );
// }

export function UpgradeModal(props: {
  checkoutSuccessPath?: string;
  checkoutCancelPath?: string;
}) {
  return null;
}
