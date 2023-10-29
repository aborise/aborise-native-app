import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FlowReturn } from "~/automations/playwright/setup/Runner";
import { Image } from "expo-image";

dayjs.extend(relativeTime);

interface AboItemProps {
  logo: string;
  title: string;
  data: NonNullable<FlowReturn["data"]>;
  styles?: any;
  className?: string;
  onContextMenu?: (event: any) => void; // Note: React Native doesn't have native context menu
}

const AboItem: React.FC<AboItemProps> = ({
  logo,
  title,
  data,
  onContextMenu,
  styles,
}) => {
  const nextPaymentRelativeDate = useMemo(
    () =>
      data.membershipStatus === "active"
        ? dayjs(data.nextPaymentDate).fromNow()
        : undefined,
    [data]
  );
  const renewsDate = useMemo(
    () =>
      data.membershipStatus === "active"
        ? dayjs(data.nextPaymentDate).format("DD.MM.YYYY")
        : undefined,
    [data]
  );
  const expiresDate = useMemo(
    () =>
      data.membershipStatus === "canceled"
        ? dayjs(data.expiresAt!).format("DD.MM.YYYY")
        : undefined,
    [data]
  );

  const { integer, decimal } = useMemo<{
    integer?: number;
    decimal?: number;
  }>(() => {
    return data.membershipStatus === "active"
      ? data.nextPaymentPrice ?? {}
      : {};
  }, [data]);

  return (
    <TouchableOpacity onLongPress={onContextMenu}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          gap: 16,
          ...styles,
        }}
      >
        <Image source={{ uri: logo }} style={{ width: 48, height: 48 }} />
        <View
          style={{ flex: 1, flexDirection: "column", alignItems: "flex-start" }}
        >
          <Text style={{ fontSize: 24 }}>{title}</Text>
          {renewsDate && (
            <Text style={{ fontSize: 12, color: "gray" }}>
              Renews {renewsDate}
            </Text>
          )}
          {expiresDate && (
            <Text style={{ fontSize: 12, color: "gray" }}>
              Expires {expiresDate}
            </Text>
          )}
          {data.membershipStatus === "inactive" && (
            <Text style={{ fontSize: 12, color: "gray" }}>Expired</Text>
          )}
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
          {integer && (
            <>
              <Text style={{ fontSize: 24 }}>
                <Text>{integer}</Text>
                <Text style={{ fontSize: 8 }}>{decimal}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: "gray" }}>Next Payment</Text>
              <Text style={{ fontSize: 10, color: "lightgray" }}>
                {nextPaymentRelativeDate}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AboItem;
