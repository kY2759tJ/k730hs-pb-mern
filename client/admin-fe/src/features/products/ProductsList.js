import React, { useMemo } from "react";
import { useGetProductsQuery } from "./productsApiSlice";
import { Space, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";

const ProductsList = React.memo(() => {
  const { username, isAdmin } = useAuth();

  const {
    data: products,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetProductsQuery("productsList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: "Product Name",
        key: "productName",
        dataIndex: "productName",
        render: (text) => <p>{text}</p>,
      },
      {
        title: "Base Price",
        dataIndex: "basePrice",
        key: "basePrice",
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => navigate(`/dash/products/${record.action}`)}
            />
          </Space>
        ),
      },
    ],
    [navigate] // Dependencies for memoization
  );

  const dataSource = useMemo(() => {
    if (!isSuccess) return [];
    const { ids, entities } = products;

    return ids
      .map((id) => {
        const product = entities[id];
        return (
          product && {
            key: id,
            productName: product.productName,
            basePrice: new Intl.NumberFormat("en-MY", {
              style: "currency",
              currency: "MYR",
            }).format(product.basePrice),
            action: id,
          }
        );
      })
      .filter(Boolean); // Remove null values
  }, [products, isSuccess]);

  let content;

  if (isLoading) {
    content = <PulseLoader color={"#FFF"} />;
  } else if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  } else {
    content = (
      <Table
        columns={columns}
        dataSource={dataSource}
      />
    );
  }

  return content;
});

export default ProductsList;
