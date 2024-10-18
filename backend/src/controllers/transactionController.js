import Transaction from "../models/transaction.js";

const getMonthIndex = (month) => {
  const monthMapping = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  return monthMapping[month.toLowerCase().trim()];
};

export const getDateRangeFromMonth = (month) => {
  const monthIndex = getMonthIndex(month);
  const start = new Date(new Date().getFullYear(), monthIndex, 1);
  const end = new Date(new Date().getFullYear(), monthIndex + 1, 0);
  return { start, end };
};

export const initializeDatabase = async () => {
  try {
    const response = await fetch(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const transactions = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      dateOfSale: new Date(item.dateOfSale),
      sold: item.sold,
      image:item.image,
    }));

    await Transaction.deleteMany({});

    await Transaction.insertMany(transactions);
    console.log("Database initialized with seed data");
    console.log("done")
  } catch (error) {
    console.error("Error during DB initialization:", error);
  }
};


export const listTransactions = async (req) => {
    const { month, page = 1, rowsPerPage = 10, search = "" } = req.query;
    const monthIndex = getMonthIndex(month);

    if (monthIndex === undefined) {
        throw new Error("Invalid month provided");
    }

    try {
        const titleOrDescriptionQuery = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ],
        };
        let priceQuery = {};
        if (!isNaN(search) && search.trim() !== "") {
            const price = parseFloat(search); 
            priceQuery = { price }; 
        }
        const query = {
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }, 
            ...titleOrDescriptionQuery,
            ...priceQuery,
        };

        const total = await Transaction.countDocuments(query); 

        const transactions = await Transaction.find(query)
            .skip((page - 1) * rowsPerPage)
            .limit(parseInt(rowsPerPage));

        return {
            total,
            page: parseInt(page),
            rowsPerPage: parseInt(rowsPerPage),
            transactions,
        };
    } catch (error) {
        throw new Error("Failed to retrieve transactions: " + error.message);
    }
};


export const getStatistics = async (req) => {
  const { month } = req.query;
  const monthIndex = getMonthIndex(month);
  if (monthIndex === undefined) {
    throw new Error("Invalid month provided");
  }
  const transactions = await Transaction.find();
  const filteredTransactions = transactions.filter((transaction) => {
    const saleDate = new Date(transaction.dateOfSale);
    return saleDate.getMonth() === monthIndex;
  });
  const totalSaleAmount = filteredTransactions.reduce(
    (acc, transaction) => acc + transaction.price,
    0
  );
  const totalSoldItems = filteredTransactions.filter(
    (transaction) => transaction.sold
  ).length;
  const totalNotSoldItems = filteredTransactions.filter(
    (transaction) => !transaction.sold
  ).length;
  return { totalSaleAmount, totalSoldItems, totalNotSoldItems };
};

export const getBarChart = async (req) => {
  const { month } = req.query;
  const monthIndex = getMonthIndex(month);
  if (monthIndex === undefined) {
    throw new Error("Invalid month provided");
  }
  const transactions = await Transaction.find();
  const filteredTransactions = transactions.filter((transaction) => {
    const saleDate = new Date(transaction.dateOfSale);
    return saleDate.getMonth() === monthIndex;
  });
  const priceRanges = {
    "0-100": 0,
    "101-200": 0,
    "201-300": 0,
    "301-400": 0,
    "401-500": 0,
    "501-600": 0,
    "601-700": 0,
    "701-800": 0,
    "801-900": 0,
    "901-above": 0,
  };
  filteredTransactions.forEach((transaction) => {
    const price = transaction.price;
    if (price >= 0 && price <= 100) {
      priceRanges["0-100"]++;
    } else if (price >= 101 && price <= 200) {
      priceRanges["101-200"]++;
    } else if (price >= 201 && price <= 300) {
      priceRanges["201-300"]++;
    } else if (price >= 301 && price <= 400) {
      priceRanges["301-400"]++;
    } else if (price >= 401 && price <= 500) {
      priceRanges["401-500"]++;
    } else if (price >= 501 && price <= 600) {
      priceRanges["501-600"]++;
    } else if (price >= 601 && price <= 700) {
      priceRanges["601-700"]++;
    } else if (price >= 701 && price <= 800) {
      priceRanges["701-800"]++;
    } else if (price >= 801 && price <= 900) {
      priceRanges["801-900"]++;
    } else {
      priceRanges["901-above"]++;
    }
  });
  return priceRanges; 
};

export const getPieChart = async (req) => {
  const { month } = req.query;
  const monthIndex = getMonthIndex(month);
  if (monthIndex === undefined) {
    throw new Error("Invalid month provided");
  }
  const transactions = await Transaction.find();
  const filteredTransactions = transactions.filter((transaction) => {
    const saleDate = new Date(transaction.dateOfSale);
    return saleDate.getMonth() === monthIndex;
  });
  const categoryCounts = {};
  filteredTransactions.forEach((transaction) => {
    const category = transaction.category;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  return Object.keys(categoryCounts).map((category) => ({
    category,
    count: categoryCounts[category],
  }));
};

export const getCombinedData = async (req, res) => {
  try {
    const transactions = await listTransactions(req, res);
    const statistics = await getStatistics(req);
    const barChart = await getBarChart(req);
    const pieChart = await getPieChart(req);
    res.json({
      transactions,
      statistics,
      barChart,
      pieChart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
