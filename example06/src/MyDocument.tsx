import React from 'react';
import {
    Image,
    Text,
    View,
    Page,
    Document,
    StyleSheet,
} from '@react-pdf/renderer';
import logo from './img/LogoHITC.png';

const MyDocument = ({ data }: { data: any }) => {
    if (!data) return null;

    const {
        cartId,
        totalPrice = 0,
        products = [],
        email,
    } = data;

    const styles = StyleSheet.create({
        page: {
            fontSize: 11,
            padding: 40,
            lineHeight: 1.6,
            flexDirection: 'column',
        },

        header: {
            marginBottom: 20,
        },

        logo: {
            width: 180,
            marginBottom: 10,
        },

        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
        },

        info: {
            fontSize: 12,
            marginBottom: 6,
        },

        tableHeader: {
            flexDirection: 'row',
            backgroundColor: '#DEDEDE',
            borderBottomWidth: 1,
        },

        th: {
            padding: 6,
            fontSize: 10,
            fontWeight: 'bold',
            flex: 1,
        },

        thName: {
            flex: 2,
        },

        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: '#eee',
        },

        td: {
            padding: 6,
            fontSize: 10,
            flex: 1,
        },

        tdName: {
            flex: 2,
        },

        totalRow: {
            flexDirection: 'row',
            marginTop: 10,
        },

        totalLabel: {
            flex: 3,
            textAlign: 'right',
            padding: 6,
            fontWeight: 'bold',
        },

        totalValue: {
            flex: 1,
            padding: 6,
            fontWeight: 'bold',
        },
    });

    const money = (v: number) => (v ?? 0).toFixed(2);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Image src={logo} style={styles.logo} />
                    <Text style={styles.title}>CART INVOICE</Text>
                    <Text style={styles.info}>Cart ID: {cartId}</Text>
                    <Text style={styles.info}>
                        Email:{' '}
                        {email || localStorage.getItem('username') || ''}
                    </Text>
                </View>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.th, styles.thName]}>
                        Product
                    </Text>
                    <Text style={styles.th}>Price</Text>
                    <Text style={styles.th}>Qty</Text>
                    <Text style={styles.th}>Amount</Text>
                </View>

                {/* TABLE BODY */}
                {products.length > 0 &&
                    products.map((p: any) => (
                        <View
                            style={styles.row}
                            key={p.productId}
                        >
                            <Text
                                style={[
                                    styles.td,
                                    styles.tdName,
                                ]}
                            >
                                {p.productName}
                            </Text>
                            <Text style={styles.td}>
                                {money(p.price)}
                            </Text>
                            <Text style={styles.td}>
                                {p.quantity ?? 0}
                            </Text>
                            <Text style={styles.td}>
                                {money(
                                    (p.price ?? 0) *
                                        (p.quantity ?? 0)
                                )}
                            </Text>
                        </View>
                    ))}

                {/* TOTAL */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                        TOTAL
                    </Text>
                    <Text style={styles.totalValue}>
                        {money(totalPrice)}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default MyDocument;
