import { v4 as uuid } from "uuid";

export const generateRentalAgreement = ({
  product, renter, owner, startDate, endDate, deposit, rentPerDay,
}) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const totalRent = days * rentPerDay;
  const agreementId = `CA-${Date.now()}-${uuid().slice(0, 6).toUpperCase()}`;
  const createdAt = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const agreementText = `
════════════════════════════════════════
         CAMPUSMART RENTAL AGREEMENT
════════════════════════════════════════

Agreement ID : ${agreementId}
Date         : ${createdAt}

─────────────────────────────────────────
PARTIES INVOLVED
─────────────────────────────────────────
Owner  : ${owner.name} (${owner.email})
Renter : ${renter.name} (${renter.email})

─────────────────────────────────────────
PRODUCT DETAILS
─────────────────────────────────────────
Title    : ${product.title}
Category : ${product.category}

─────────────────────────────────────────
RENTAL PERIOD
─────────────────────────────────────────
From : ${start.toDateString()}
To   : ${end.toDateString()}
Days : ${days} day(s)

─────────────────────────────────────────
PAYMENT SUMMARY
─────────────────────────────────────────
Rent per Day : ₹${rentPerDay}
Total Rent   : ₹${totalRent}  (${days} × ₹${rentPerDay})
Deposit      : ₹${deposit}
Total Payable: ₹${totalRent + deposit}

─────────────────────────────────────────
TERMS & CONDITIONS
─────────────────────────────────────────
1. The renter agrees to return the item in the same
   condition it was received.

2. Any damage to the product will result in partial
   or full deduction from the security deposit.

3. Late return beyond the agreed end date will incur
   an additional charge of ₹${rentPerDay} per extra day.

4. The owner guarantees the item is functional and
   as described at the time of handover.

5. This agreement is binding upon acceptance and
   serves as proof of transaction on CampusMart.

─────────────────────────────────────────
ACCEPTANCE
─────────────────────────────────────────
By clicking "Accept & Confirm", the renter
acknowledges and agrees to all terms above.

════════════════════════════════════════
`.trim();

  return { agreementText, agreementId, createdAt };
};