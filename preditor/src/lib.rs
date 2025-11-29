pub mod prediction;
pub mod algorithms;
pub mod error;
pub mod data;
pub mod metrics;
pub mod preprocessing;
// scripts removido porque estava quebrando o build

use pyo3::prelude::*;
use prediction::{TimeSeries, PredictionParams};
use algorithms::linear_regression::{fit_linear_regression, predict_from_linear};

#[pyfunction]
fn prever(valores: Vec<f64>) -> PyResult<f64> {
    if valores.len() < 2 {
        return Err(pyo3::exceptions::PyValueError::new_err(
            "Forneça pelo menos 2 valores",
        ));
    }

    let serie = TimeSeries {
        values: valores.clone(),
        timestamps: None,
    };

    let x: Vec<f64> = (0..serie.values.len()).map(|i| i as f64).collect();
    let y = serie.values.clone();

    let (slope, intercept) = fit_linear_regression(&x, &y)
        .ok_or_else(|| pyo3::exceptions::PyException::new_err("Falha na regressão"))?;

    let next_x = serie.values.len() as f64;
    let next = predict_from_linear(slope, intercept, next_x);

    Ok(next)
}

#[pymodule]
fn preditor(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(prever, m)?)?;
    Ok(())
}
