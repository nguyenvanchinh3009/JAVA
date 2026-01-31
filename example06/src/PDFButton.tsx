import { BlobProvider } from '@react-pdf/renderer';
import React, { useEffect, useState } from 'react';
import { HiOutlinePrinter } from 'react-icons/hi';
import MyDocument from './MyDocument';

const PDFButton = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const cartId = localStorage.getItem('globalCartId');
            const token = localStorage.getItem('jwt-token');

            // ⚠️ ƯU TIÊN username
            const email =
                localStorage.getItem('globalEmailCart') ||
                localStorage.getItem('username');

            if (!cartId || !email) {
                setError('Missing cartId or email');
                setLoading(false);
                return;
            }

            if (!token) {
                setError('Missing token');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(
                    `http://localhost:8080/api/public/user/${email}/carts/${cartId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <span>Loading PDF...</span>;
    if (error) return <span style={{ color: 'red' }}>PDF Error: {error}</span>;
    if (!data) return null;

    const styles = {
        btn: {
            borderRadius: 4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            fontSize: 12,
            color: '#ffd700',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'transparent',
            textDecoration: 'none',
            border: '1px solid #ffd70055',
        },
    };

    return (
        <BlobProvider document={<MyDocument data={data} />}>
            {({ url, loading }) =>
                loading || !url ? (
                    <span>Generating PDF...</span>
                ) : (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.btn}
                    >
                        <HiOutlinePrinter size={16} />
                        PRINT
                    </a>
                )
            }
        </BlobProvider>
    );
};

export default PDFButton;
