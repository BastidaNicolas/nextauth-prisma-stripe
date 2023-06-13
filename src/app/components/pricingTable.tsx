const products = [
  {
    products: [
      {
        name: "base",
        type: "year",
        price: "142,99",
        productId: "price_1NDCZ3IMQotP1KSIxFBL4LwI",
        description: [
          "Appointment scheduling",
          "Patient notification",
          "Create up to one office",
          "appointment Tagging System",
          "Appointment status updates",
          "Appointment history tracking and filtering",
        ],
        active: true,
      },
      {
        name: "Office+",
        type: "year",
        price: "238,99",
        productId: "price_1NDCYGIMQotP1KSIv178valr",
        description: [
          "Appointment scheduling",
          "Patient notification",
          "Create up to one office",
        ],
        active: true,
      },
      {
        name: "Enterprize",
        type: "year",
        price: "238,99",
        productId: "",
        description: [
          "Appointment scheduling",
          "Patient notification",
          "Create up to one office",
          "appointment Tagging System",
          "Appointment status updates",
          "Appointment history tracking and filtering",
        ],
        active: false,
      },
    ],
  },
  {
    products: [
      {
        name: "base",
        type: "month",
        price: "14,99",
        productId: "price_1NDCWcIMQotP1KSIBt3qrxLB",
        description: [
          "Appointment scheduling",
          "Patient notification",
          "Create up to one office",
          "appointment Tagging System",
          "Appointment status updates",
          "Appointment history tracking and filtering",
        ],
        active: true,
      },
      {
        name: "Office+",
        type: "month",
        price: "24,99",
        productId: "price_1NDCYGIMQotP1KSIn5rvmYEh",
        description: [
          "Appointment scheduling",
          "Patient notification",
          "Create up to one office",
        ],
        active: true,
      },
      {
        name: "Enterprize",
        type: "month",
        price: "24,99",
        productId: "",
        description: [
          "Appointment scheduling",
          "Patient notification",
          "Create up to one office",
          "appointment Tagging System",
          "Appointment status updates",
          "Appointment history tracking and filtering",
        ],
        active: false,
      },
    ],
  },
];

export function ProductCard({
  selectedPlan,
  product,
}: {
  selectedPlan: {
    plan: string;
    setPlan: React.Dispatch<React.SetStateAction<string>>;
  };
  product: {
    name: string;
    type: string;
    price: string;
    productId: string;
    description: string[];
    active: boolean;
  };
}) {
  if (product.active) {
    return (
      <div
        className={`p-10 border-2 hover:cursor-pointer ${
          selectedPlan.plan === product.productId
            ? "-translate-y-2"
            : "hover:-translate-y-2"
        } transition-all w-full max-w-[21rem] min-h-[22rem] bg-black`}
        onClick={() => selectedPlan.setPlan(product.productId)}
      >
        <div className="font-bold text-3xl mb-2 capitalize">
          {product.name} Plan
        </div>
        <div className="flex items-baseline mb-2">
          <div className="text-3xl mr-2">${product.price}</div> Per{" "}
          {product.type}
        </div>
        <ul className="list-disc pl-4 ">
          {product.description.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div
      className={`p-10 border-2 border-neutral-400 text-neutral-400 w-full max-w-[21rem] min-h-[22rem] bg-black`}
    >
      <div className="font-bold text-3xl mb-2 capitalize">
        {product.name} Plan
      </div>
      <div className="flex items-baseline mb-2">
        <div className="text-3xl mr-2">${product.price}</div> Per {product.type}
      </div>
      <ul className="list-disc pl-4 ">
        {product.description.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingTable({
  selectedPlan,
  selectedType,
}: {
  selectedPlan: {
    plan: string;
    setPlan: React.Dispatch<React.SetStateAction<string>>;
  };
  selectedType: {
    type: string;
    setType: React.Dispatch<React.SetStateAction<string>>;
  };
}) {
  return (
    <>
      <div className="flex mb-6 m-auto">
        <div className="px-5 py-2 border m-2 hover:cursor-pointer" onClick={() => selectedType.setType("monthly")}>
          Monthly
        </div>
        <div className="px-5 py-2 border m-2 hover:cursor-pointer" onClick={() => selectedType.setType("yearly")}>
          Yearly
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {selectedType.type === "monthly"
          ? products[1].products.map((product, index) => (
              <ProductCard
                selectedPlan={selectedPlan}
                product={product}
                key={index}
              />
            ))
          : products[0].products.map((product, index) => (
              <ProductCard
                selectedPlan={selectedPlan}
                product={product}
                key={index}
              />
            ))}
      </div>
    </>
  );
}
